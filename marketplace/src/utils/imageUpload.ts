import { supabase } from "@/integrations/supabase/client";

export async function uploadImagesViaEdge(
  files: File[],
  propertyId: string
): Promise<string[]> {
  // Create form data to attach images
  const formData = new FormData();

  // Add the property id to the form data
  formData.append("property_id", propertyId);

  // Add images to the form data
  files.forEach((file) => {
    formData.append("images", file, file.name);
  });

  // Upload the images via the edge function
  const { data: urls, error: uploadError } = await supabase.functions.invoke(
    "upload-property-images",
    {
      body: formData,
    }
  );

  // Handle errors
  if (uploadError) {
    throw new Error(`Image upload failed: ${uploadError.message}.`);
  }

  // Ensure the response is valid
  if (!urls || !Array.isArray(urls)) {
    throw new Error("Invalid response from image upload function.");
  }

  // Return the array of image URLs
  return urls as string[];
}

export async function deleteImageViaEdge(imageUrl: string) {
  try {
    supabase.functions.invoke("delete-image", {
      body: {
        url: imageUrl,
      },
    });
  } catch (error) {
    console.error("Error parsing image URL:", error);
  }
}
