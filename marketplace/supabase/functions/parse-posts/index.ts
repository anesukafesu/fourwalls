import { createClient } from "npm:@supabase/supabase-js@2";

// CORS Headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// System prompt for the LLM
const SYSTEM_PROMPT = `
You are a real estate data extraction expert. Your task is to analyze social media posts about real estate properties and extract structured property information.

Database Schema for Properties:
- title: string (required)
- neighbourhood: string (required)
- city: string (required)
- price: number (required, in RWF)
- bedrooms: number (optional)
- bathrooms: number (optional)
- square_feet: number (optional)
- status: string (one of: "for_sale", "for_rent", "sold", "rented", "off_market")
- property_type: string (one of: "house", "apartment", "condo", "townhouse", "commercial", "land", "other")
- description: string (optional)
- features: string array (optional)
- year_built: number (optional)
- lot_size: number (optional)
- images: array of strings (urls to images)

Instructions:
1. Extract property information from each post delimited by "POST_START" and "POST_END".
2. Only include properties that have AT MINIMUM: title, address, city, province, and price.
3. Convert prices to numbers (remove currency symbols, commas, and translate 500k to 500000 RWF, and 50M to 50000000 RWF).
4. Infer missing information intelligently when possible. Based on the price, infer if the listing is advertising a property for rent or for sale (but only if the listing doesn't explicitly specify).
5. Translate any Kinyarwanda text to English.
6. Generate medium-length descriptions for each property and create catchy, creative titles. Bonus points for puns or pop culture references.
7. If the neighbourhood name is unknown, use the ID for the neighbourhood "Other".
8. Return a JSON array of property objects with the fields mentioned above, including a list of image URLs.
9. For posts with images, ensure they are uploaded to Supabase and that property_images entries are created.

Response format: Return only a valid JSON array, no other text.
`;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the current user
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      });
    }

    const { post_ids: postIds, user_id: userId } = await req.json();

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "post_ids array is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Fetch posts from listings_buffer
    const { data: posts, error: fetchError } = await supabaseClient
      .from("listings_buffer")
      .select("*")
      .in("id", postIds)
      .eq("user_id", userId);

    if (fetchError) {
      console.error("Error fetching posts:", fetchError);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch posts",
          details: fetchError.message,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    if (!posts || posts.length === 0) {
      return new Response(
        JSON.stringify({ error: "No posts found for the given IDs" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404,
        }
      );
    }

    // Join posts into a single message for processing
    const combinedMessage = posts
      .map(
        (post) => `POST_START\n${post.post_text || "No text content"}\nPOST_END`
      )
      .join("\n\n");

    // Get Google Gemini API key
    const geminiApiKey = Deno.env.get("GOOGLE_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "Google Gemini API key not configured" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Send the request to Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": geminiApiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${SYSTEM_PROMPT}\n\nPosts to analyze:\n${combinedMessage}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      return new Response(
        JSON.stringify({
          error: "Failed to process with Gemini API",
          details: errorText,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const geminiData = await geminiResponse.json();
    const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return new Response(
        JSON.stringify({ error: "No response from Gemini API" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Parse the JSON response
    let properties;
    try {
      const cleanJson = generatedText.replace(/```json\n?|\n?```/g, "").trim();
      properties = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", generatedText);
      return new Response(
        JSON.stringify({
          error: "Failed to parse AI response",
          details: parseError.message,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    if (!Array.isArray(properties)) {
      return new Response(
        JSON.stringify({ error: "AI response is not an array" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Map neighbourhood names to IDs and handle unknown ones
    const { data: neighbourhoods, error: fetchNeighbourhoodsError } =
      await supabaseClient.from("neighbourhoods").select("id, name");

    if (fetchNeighbourhoodsError) {
      console.error("Error fetching neighbourhoods:", fetchNeighbourhoodsError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch neighbourhoods" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const neighbourhoodMap = neighbourhoods.reduce((acc, neighbourhood) => {
      acc[neighbourhood.name.toLowerCase()] = neighbourhood.id;
      return acc;
    }, {});

    const validProperties = properties
      .filter(
        (prop) =>
          prop.title &&
          prop.address &&
          prop.city &&
          prop.province &&
          prop.price
      )
      .map((prop) => {
        // Convert price and infer status
        const price = parsePrice(prop.price);

        return {
          ...prop,
          price,
          status: inferStatus(price, prop.status),
          neighbourhood:
            neighbourhoodMap[prop.neighbourhood.toLowerCase()] ||
            neighbourhoodMap["other"],
          agent_id: userId,
          created_at: new Date().toISOString(),
        };
      });

    // Insert properties into the database
    const { data: insertedProperties, error: insertError } =
      await supabaseClient.from("properties").insert(validProperties).select();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return new Response(
        JSON.stringify({
          error: "Failed to insert properties",
          details: insertError.message,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );

    }

    // Handle image uploads
    const imageUrls = await uploadPropertyImages(validProperties, supabaseClient);

    return new Response(
      JSON.stringify({
        success: true,
        properties_added: insertedProperties?.length || 0,
        total_processed: posts.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Helper functions like price parsing, status inference, image uploads, etc.
function parsePrice(price) {
  let parsedPrice = parseInt(price.replace(/[^\d]/g, ""));
  if (price.includes("k")) {
    parsedPrice *= 1000;
  } else if (price.includes("M")) {
    parsedPrice *= 1000000;
  }
  return parsedPrice;
}

function inferStatus(price, status) {
  if (!status) {
    return price > 500000 ? "for_sale" : "for_rent";  // Assuming price > 500k is for sale
  }
  return status;
}

async function uploadPropertyImages(properties, supabaseClient) {
  const uploadedImageUrls = [];
  
  for (const prop of properties) {
    if (prop.images && prop.images.length > 0) {
      for (const image of prop.images) {
        // Generate a random name for the image
        const randomName = `${Math.random().toString(36).substr(2, 9)}.jpg`;
        const path = `property_images/${prop.id}/${randomName}`;
        
        // Upload image to Supabase Storage
        const { data, error: uploadError } = await supabaseClient.storage
          .from("property_images")
          .upload(path, image, { cacheControl: "3600", upsert: false });

        if (uploadError) {
          console.error("Image upload error:", uploadError);
          continue;
        }

        // Get image URL
        const imageUrl = `${Deno.env.get("SUPABASE_URL")}/storage/v1/object/public/${path}`;

        // Call embedding API for image analysis
        const embeddingResponse = await fetch("https://akafesu-fourwalls-embeddings-api.hf.space/embed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: imageUrl }),
        });

        const embeddingData = await embeddingResponse.json();
        const { embedding, aspect, confidence } = embeddingData;

        // Insert image data into property_images table
        const { error: insertImageError } = await supabaseClient
          .from("property_images")
          .insert([
            {
              property_id: prop.id,
              url: imageUrl,
              embedding,
              aspect,
              confidence,
              created_at: new Date().toISOString(),
            },
          ]);

        if (insertImageError) {
          console.error("Error inserting image data:", insertImageError);
        } else {
          uploadedImageUrls.push(imageUrl);
        }
      }
    }
  }
  
  // Return the uploaded image URLs
  return uploadedImageUrls;
}
