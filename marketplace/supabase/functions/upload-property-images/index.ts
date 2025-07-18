import { createClient } from "npm:@supabase/supabase-js";

const EMBEDDING_API_URL = Deno.env.get("EMBEDDING_API_URL")!;
const EMBEDDING_API_KEY = Deno.env.get("EMBEDDING_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const allowedHeaders = [
  "authorization",
  "x-client-info",
  "apikey",
  "content-type",
];

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": allowedHeaders.join(", "),
  "Content-Type": "application/json",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("OK", {
      status: 200,
      headers,
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers });
  }

  const contentType = req.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return new Response("Invalid content type", { status: 400, headers });
  }

  const formData = await req.formData();
  const propertyId = formData.get("property_id") as string;
  if (!propertyId) {
    return new Response("Missing property_id", { status: 400, headers });
  }

  // Get all images
  const images: File[] = [];
  for (const [key, value] of formData.entries()) {
    if (key === "images" && value instanceof File) {
      images.push(value);
    }
  }

  if (images.length === 0) {
    return new Response("No images provided", { status: 400, headers });
  }

  // Create the client
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const storageBucket = "property-images";

  // Loop through each image and process it
  const results = [];
  for (const image of images) {
    // Step 1: Validate image type
    if (!image.type.startsWith("image/")) {
      return new Response(`Invalid image type: ${image.type}`, {
        status: 400,
        headers,
      });
    }

    // Step 2: Embed the image
    const formData = new FormData();
    formData.append("file", image, image.name);
    const response = await fetch(`${EMBEDDING_API_URL}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${EMBEDDING_API_KEY}`,
      },
      body: formData,
    });

    // Validate the embedding response
    if (!response.ok) {
      results.push({ error: `Embedding API failed: ${response.statusText}` });
      continue;
    }

    const {
      embedding,
      predicted_label: aspect,
      confidence,
    } = await response.json();
    if (!embedding || !aspect || !confidence) {
      results.push({ error: "Invalid embedding response" });
      continue;
    }

    // Step 2: Upload the image to Supabase storage
    const fileName = `${crypto.randomUUID()}-${image.name}`;
    const uploadPath = `${propertyId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(storageBucket)
      .upload(uploadPath, image.stream(), { contentType: image.type });

    if (uploadError) {
      results.push({ error: `Failed to upload image: ${uploadError.message}` });
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(storageBucket).getPublicUrl(uploadPath);

    // Step 3: Store record in Supabase
    const { error: dbError } = await supabase.from("property_images").insert({
      property_id: propertyId,
      url: publicUrl,
      embedding,
      aspect,
      confidence,
    });

    if (dbError) {
      results.push({ error: `DB insert failed: ${dbError.message}` });
      continue;
    }

    results.push(publicUrl);
  }

  const hasError = results.some((r) => r.error);
  return new Response(JSON.stringify(results), {
    status: hasError ? 207 : 200,
    headers: headers,
  });
});
