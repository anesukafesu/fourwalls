
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useBookmarks = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's bookmarks with property details
  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ["bookmarks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('property_bookmarks')
        .select(`
          id,
          created_at,
          property_id,
          properties (
            id,
            title,
            price,
            city,
            status,
            bedrooms,
            bathrooms,
            interior_size_sqm,
            property_type,
            images,
            neighbourhood
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match the expected structure
      return (data || []).map(bookmark => ({
        id: bookmark.id,
        created_at: bookmark.created_at,
        property_id: bookmark.property_id,
        property: bookmark.properties
      }));
    },
    enabled: !!user,
  });

  // Toggle bookmark mutation
  const toggleBookmarkMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user) throw new Error("User not authenticated");

      // Check if already bookmarked
      const { data: existing } = await supabase
        .from("property_bookmarks")
        .select("id")
        .eq("user_id", user.id)
        .eq("property_id", propertyId)
        .single();

      if (existing) {
        // Remove bookmark
        const { error } = await supabase
          .from("property_bookmarks")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
        return { action: "removed" };
      } else {
        // Add bookmark
        const { error } = await supabase.from("property_bookmarks").insert({
          user_id: user.id,
          property_id: propertyId,
        });
        if (error) throw error;
        return { action: "added" };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks", user?.id] });
      toast.success(
        result.action === "added" ? "Property bookmarked!" : "Bookmark removed"
      );
    },
    onError: (error) => {
      toast.error("Failed to update bookmark: " + error.message);
    },
  });

  // Check if property is bookmarked
  const isBookmarked = (propertyId: string) => {
    return (
      bookmarks?.some((bookmark) => bookmark.property_id === propertyId) ||
      false
    );
  };

  return {
    bookmarks,
    isLoading,
    toggleBookmark: toggleBookmarkMutation.mutate,
    isToggling: toggleBookmarkMutation.isPending,
    isBookmarked,
  };
};
