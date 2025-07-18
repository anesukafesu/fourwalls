import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface FacebookPost {
  id: string;
  message?: string;
  created_time: string;
  full_picture?: string;
  attachments?: {
    data: Array<{
      media?: {
        image?: { src: string };
      };
      subattachments?: {
        data: Array<{
          media?: {
            image?: { src: string };
          };
        }>;
      };
    }>;
  };
}

interface FacebookResponse {
  data: FacebookPost[];
  paging?: {
    next?: string;
  };
}

// Simple housing classification using keywords
function classifyAsHousing(message: string): boolean {
  if (!message) return false;

  const housingKeywords = [
    "house",
    "home",
    "property",
    "real estate",
    "for sale",
    "for rent",
    "bedroom",
    "bathroom",
    "kitchen",
    "garage",
    "yard",
    "apartment",
    "condo",
    "listing",
    "price",
    "sqft",
    "square feet",
    "mortgage",
    "lease",
    "rental",
    "landlord",
    "tenant",
    "utilities",
    "furnished",
    "unfurnished",
    "deposit",
    "realtor",
    "agent",
    "viewing",
    "tour",
  ];

  const lowerMessage = message.toLowerCase();
  return housingKeywords.some((keyword) => lowerMessage.includes(keyword));
}

// Extract image URLs from Facebook post
function extractImageUrls(post: FacebookPost): string[] {
  const images: string[] = [];

  if (post.full_picture) {
    images.push(post.full_picture);
  }

  if (post.attachments?.data) {
    for (const attachment of post.attachments.data) {
      if (attachment.media?.image?.src) {
        images.push(attachment.media.image.src);
      }

      if (attachment.subattachments?.data) {
        for (const subAttachment of attachment.subattachments.data) {
          if (subAttachment.media?.image?.src) {
            images.push(subAttachment.media.image.src);
          }
        }
      }
    }
  }

  // Ensure that only one of each image is saved
  return Array.from(new Set(images));
}

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

    const { code, redirect_uri: redirectUri } = await req.json();

    if (!code) {
      return new Response(JSON.stringify({ error: "Code is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (!redirectUri) {
      return new Response(
        JSON.stringify({ error: "Redirect URI is required" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Get Facebook App credentials from Supabase secrets
    const facebookAppId = Deno.env.get("FACEBOOK_APP_ID");
    const facebookAppSecret = Deno.env.get("FACEBOOK_APP_SECRET");

    if (!facebookAppId || !facebookAppSecret) {
      return new Response(
        JSON.stringify({ error: "Facebook App credentials not configured" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Exchange authorization code for access token
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${facebookAppId}&redirect_uri=${redirectUri}&client_secret=${facebookAppSecret}&code=${code}`;

    const tokenResponse = await fetch(tokenUrl);
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Facebook token exchange error:", tokenData.error);
      return new Response(
        JSON.stringify({
          error: "Failed to exchange authorization code",
          details: tokenData.error,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const accessToken = tokenData.access_token;

    // Calculate date one year ago
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const sinceTimestamp = Math.floor(oneYearAgo.getTime() / 1000);

    // Fetch user posts from Facebook with pagination
    let allPosts: FacebookPost[] = [];
    let nextUrl = `https://graph.facebook.com/v18.0/me/posts?fields=id,message,created_time,full_picture,attachments{media,subattachments}&since=${sinceTimestamp}&limit=25&access_token=${accessToken}`;

    while (nextUrl) {
      const postsResponse = await fetch(nextUrl);
      const postsData: FacebookResponse = await postsResponse.json();

      if (postsData.error) {
        console.error("Facebook posts fetch error:", postsData.error);
        break;
      }

      if (postsData.data && postsData.data.length > 0) {
        allPosts = [...allPosts, ...postsData.data];
      }

      // Check for next page
      nextUrl = postsData.paging?.next || null;

      // Add a small delay to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Classify posts as housing-related
    const housingPosts = allPosts.filter(
      (post) => post.message && classifyAsHousing(post.message)
    );

    // Prepare listings for insertion
    const listingsToInsert = housingPosts.map((post) => ({
      user_id: user.id,
      post_id: post.id,
      post_text: post.message || null,
      image_urls: extractImageUrls(post),
      source_url: `https://facebook.com/${post.id}`,
      extracted_at: new Date().toISOString(),
    }));

    if (listingsToInsert.length > 0) {
      // Insert housing posts into listings_buffer
      const { data, error } = await supabaseClient
        .from("listings_buffer")
        .insert(listingsToInsert)
        .select();

      if (error) {
        console.error("Database error:", error);
        return new Response(
          JSON.stringify({
            error: "Failed to save posts",
            details: error.message,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Successfully processed ${allPosts.length} posts, found ${housingPosts.length} housing-related posts`,
          total_posts: allPosts.length,
          housing_posts: housingPosts.length,
          posts_saved: data.length,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Processed ${allPosts.length} posts, but no housing-related content was found`,
          total_posts: allPosts.length,
          housing_posts: 0,
          posts_saved: 0,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
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
