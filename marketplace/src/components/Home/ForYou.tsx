
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PropertiesSpotlight from "./PropertiesSpotlight";

const ForYou = () => {
  const { user } = useAuth();

  // Get user's recent 30 property views
  const { data: recentViews } = useQuery({
    queryKey: ["user-recent-views", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("property_views")
        .select("property_id")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(30);

      if (error) throw error;
      return data.map((view) => view.property_id);
    },
    enabled: !!user?.id,
  });

  // Get recommendations based on view history
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["user-recommendations", recentViews],
    queryFn: async () => {
      if (!recentViews || recentViews.length === 0) return [];

      try {
        const response = await fetch(
          "https://akafesu-fourwalls-recommendations-api.hf.space/recommendations/from-history",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              viewed_ids: recentViews,
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to fetch recommendations");

        const { recommended_ids: recommendedIds } = await response.json();
        // Fetch property details for recommended IDs
        if (recommendedIds && recommendedIds.length > 0) {
          const { data: properties, error } = await supabase
            .from("properties")
            .select("*")
            .in("id", recommendedIds)
            .limit(6);

          if (error) throw error;
          return properties || [];
        }

        return [];
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        return [];
      }
    },
    enabled: !!recentViews && recentViews.length > 0,
  });

  if (!user) return null;

  if (!recommendations || recommendations?.length === 0) return <div></div>;
  return (
    <PropertiesSpotlight
      title="More For You"
      subtitle="Additional properties you might find interesting."
      properties={recommendations}
      isLoading={isLoading}
      emptyStateTitle="No recommendations yet"
      emptyStateSubtitle="We will show recommendations based on your activity here."
    />
  );
};

export default ForYou;
