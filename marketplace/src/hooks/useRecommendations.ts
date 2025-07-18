
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useRecommendationsFromBookmarks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bookmark-recommendations", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First, fetch user's bookmarks ordered by creation date
      const { data: bookmarks, error: bookmarksError } = await supabase
        .from("property_bookmarks")
        .select("property_id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (bookmarksError) throw bookmarksError;
      if (!bookmarks || bookmarks.length === 0) return [];

      // Extract property IDs
      const propertyIds = bookmarks.map(bookmark => bookmark.property_id);

      try {
        // Send to recommendation API
        const response = await fetch(
          "https://akafesu-fourwalls-recommendations-api.hf.space/recommendations/from-history",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              viewed_ids: propertyIds,
            }),
          }
        );

        if (!response.ok) {
          console.error("Recommendation API error:", response.status);
          return [];
        }

        const recommendationData = await response.json();
        const recommendedIds = recommendationData.recommended_ids || [];

        if (recommendedIds.length === 0) return [];

        // Fetch property details for recommended IDs
        const { data: properties, error: propertiesError } = await supabase
          .from("properties")
          .select(`
            id,
            title,
            price,
            city,
            neighbourhood,
            status,
            bedrooms,
            bathrooms,
            interior_size_sqm,
            property_type,
            images,
            agent_id,
            created_at
          `)
          .in("id", recommendedIds)
          .limit(6);

        if (propertiesError) throw propertiesError;
        return properties || [];
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        return [];
      }
    },
    enabled: !!user,
  });
};
