import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { PropertyFormData } from "./usePropertyForm";

export function usePropertyMutations(isEditing: boolean, id?: string) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async ({
      data,
      imageFiles,
    }: {
      data: PropertyFormData;
      imageFiles: File[];
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Create a property entry without images and get the id
      const { data: inserted, error: insertError } = await supabase
        .from("properties")
        .insert({
          ...data,
          images: [],
          agent_id: user.id,
        })
        .select("id")
        .single();

      // Check for errors during insertion
      if (insertError) throw insertError;

      // Get the property id from the inserted data
      const propertyId = inserted.id;

      // Initialize an array to hold the images urls
      let imageUrls = [];

      // If there are new images, saved as image files locally, upload them
      // and append to the existing images

      for (const image of imageFiles) {
        const { error: imageUploadError } = await supabase.storage
          .from("property-images")
          .upload(`${propertyId}/${image.name}`, image);

        if (imageUploadError) continue;

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("property-images")
          .getPublicUrl(`${propertyId}/${image.name}`);

        imageUrls.push(publicUrl);
      }

      // Update the database entry to include all images
      const { error: updateError } = await supabase
        .from("properties")
        .update({ images: imageUrls })
        .eq("id", propertyId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Property created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      navigate("/properties");
    },
    onError: (error) => {
      console.error("Error creating property:", error);
      toast({
        title: "Error",
        description: "Failed to create property. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      data,
      imageFiles,
    }: {
      data: PropertyFormData;
      imageFiles: File[];
    }) => {
      if (!user || !id)
        throw new Error("User not authenticated or property ID missing");

      let allImages = [...data.images];

      for (const image of imageFiles) {
        const { error: imageUploadError } = await supabase.storage

          .from("property-images")
          .upload(`properties/${id}/${image.name}`, image);

        if (imageUploadError) continue;
        const {
          data: { publicUrl },
        } = supabase.storage
          .from("property-images")
          .getPublicUrl(`properties/${id}/${image.name}`);
        allImages.push(publicUrl);
      }

      const { error } = await supabase
        .from("properties")
        .update({
          ...data,
          images: allImages,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Property updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", id] });
      navigate("/properties");
    },
    onError: (error) => {
      console.error("Error updating property:", error);
      toast({
        title: "Error",
        description: "Failed to update property. Please try again.",
        variant: "destructive",
      });
    },
  });

  return { createMutation, updateMutation };
}
