
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PropertiesSpotlight from "./PropertiesSpotlight";

const PopularProperties = () => {
  const { data: properties, isLoading } = useQuery({
    queryKey: ["popular-properties"],
    queryFn: async () => {
      // Get property views and bookmarks
      const { data: views, error: viewError } = await supabase
        .from("property_views")
        .select("property_id");

      if (viewError) throw viewError;

      const { data: bookmarks, error: bookmarkError } = await supabase
        .from("property_bookmarks")
        .select("property_id");

      if (bookmarkError) throw bookmarkError;

      // Calculate popularity scores (bookmark = 3 views)
      const popularityScores: { [key: string]: number } = {};

      views?.forEach((view) => {
        popularityScores[view.property_id] = (popularityScores[view.property_id] || 0) + 1;
      });

      bookmarks?.forEach((bookmark) => {
        popularityScores[bookmark.property_id] = (popularityScores[bookmark.property_id] || 0) + 3;
      });

      // Get top property IDs by popularity
      const topPropertyIds = Object.entries(popularityScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([id]) => id);

      if (topPropertyIds.length === 0) return [];

      // Fetch properties
      const { data: properties, error: propError } = await supabase
        .from("properties")
        .select("*")
        .in("id", topPropertyIds)
        .in("status", ["for_sale", "for_rent"]);

      if (propError) throw propError;

      // Sort properties by popularity score
      const propertyMap = Object.fromEntries(
        (properties || []).map((p) => [p.id, p])
      );

      return topPropertyIds
        .map((id) => propertyMap[id])
        .filter(Boolean);
    },
  });

  return (
    <PropertiesSpotlight
      title="Most Popular Properties"
      subtitle="Properties that are getting the most attention from our community."
      properties={properties}
      isLoading={isLoading}
      primaryAction={{
        navigateTo: "/properties",
        label: "View all properties",
      }}
      emptyStateTitle="No popular properties yet"
      emptyStateSubtitle="Properties will appear here as they gain views and bookmarks."
    />
  );
};

export default PopularProperties;
