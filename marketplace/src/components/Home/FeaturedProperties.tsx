
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PropertiesSpotlight from "./PropertiesSpotlight";

const FeaturedProperties = () => {
  const { user } = useAuth();

  const { data: properties, isLoading } = useQuery({
    queryKey: ["featured-properties", !!user],
    queryFn: async () => {
     
      if (user) {
        // For signed-in users: Get properties based on view history
        const { data: recentViews } = await supabase
          .from("property_views")
          .select("property_id")
          .eq("user_id", user.id)
          .order("viewed_at", { ascending: false })
          .limit(30);

        if (!recentViews || recentViews.length === 0) {
          // If no viewing history, fall back to popular properties
          return getPopularProperties();
        }

        try {
          const response = await fetch(
            "https://akafesu-fourwalls-recommendations-api.hf.space/recommendations/from-history",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                viewed_ids: recentViews.map(v => v.property_id),
              }),
            }
          );

          if (!response.ok) {
            console.error("Failed to fetch recommendations");
            return getPopularProperties();
          }

          const { recommended_ids: recommendedIds } = await response.json();
          
          if (recommendedIds && recommendedIds.length > 0) {
            const { data: properties, error } = await supabase
              .from("properties")
              .select("*")
              .in("id", recommendedIds)
              .in("status", ["for_sale", "for_rent"])
              .limit(6);

            if (error) throw error;
            return properties || [];
          }

          return getPopularProperties();
        } catch (error) {
          console.error("Error fetching recommendations:", error);
          return getPopularProperties();
        }
      } else {
        // For non-signed-in users: Show most popular properties
        return getPopularProperties();
      }
    },
  });

  const getPopularProperties = async () => {
    // Step 1: Get property views (limit to recent 1000 for performance)
    const { data: views, error: viewError } = await supabase
      .from("property_views")
      .select("property_id")
      .limit(1000);
    
    console.log(views);

    if (viewError) throw viewError;
    if (!views || views.length === 0) return [];

    // Count views per property_id
    const viewCounts = {};
    for (const v of views) {
      if (!viewCounts[v.property_id]) viewCounts[v.property_id] = 0;
      viewCounts[v.property_id]++;
    }
    
    // Sort property_ids by view count descending
    const sortedPropertyIds = Object.entries(viewCounts)
      .sort((a, b) => Number(b[1]) - Number(a[1]))
      .map(([id]) => id);

    // Step 2: Fetch available properties by those IDs
    const { data: availableProperties, error: propError } = await supabase
      .from("properties")
      .select("*")
      .in("id", sortedPropertyIds)
      .in("status", ["for_sale", "for_rent"]);

    if (propError) throw propError;
    if (!availableProperties) return [];

    // Sort properties by view count order
    const propertyMap = Object.fromEntries(
      availableProperties.map((p) => [p.id, p])
    );
    const sorted = sortedPropertyIds
      .map((id) => propertyMap[id])
      .filter(Boolean)
      .slice(0, 6);
    return sorted;
  };

  return (
    <PropertiesSpotlight
      title="Recommended for you"
      subtitle={
        user 
          ? "Properties recommended based on your viewing history."
          : "Discover the most viewed properties that capture everyone's attention."
      }
      properties={properties}
      isLoading={isLoading}
      primaryAction={{
        navigateTo: "/properties",
        label: "View all properties",
      }}
      emptyStateTitle="No properties yet"
      emptyStateSubtitle="Be the first to add a property and showcase it here."
      emptyStateAction={{
        navigateTo: "/properties/add",
        label: "Add a property",
      }}
    />
  );
};

export default FeaturedProperties;
