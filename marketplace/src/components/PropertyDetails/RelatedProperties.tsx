import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PropertyCard from "@/components/Home/PropertyCard";

interface RelatedPropertiesProps {
  propertyId: string;
}

const RelatedProperties = ({ propertyId }: RelatedPropertiesProps) => {
  console.log(propertyId);
  const { data: relatedProperties, isLoading } = useQuery({
    queryKey: ["related-properties", propertyId],
    queryFn: async () => {
      try {
        // Get recommendations from the API
        const response = await fetch(
          `https://akafesu-fourwalls-recommendations-api.hf.space/recommendations/${propertyId}`
        );

        if (!response.ok) {
          console.error("Failed to fetch recommendations");
          return [];
        }

        const { recommended_ids: recommendedIds } = await response.json();

        if (!recommendedIds || recommendedIds.length === 0) {
          return [];
        }

        // Fetch property details for recommended IDs
        const { data: properties, error } = await supabase
          .from("properties")
          .select("*")
          .in("id", recommendedIds)
          .limit(3);

        if (error) throw error;
        return properties || [];
      } catch (error) {
        console.error("Error fetching related properties:", error);
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Related Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 h-64 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!relatedProperties || relatedProperties.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Related Properties</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
};

export default RelatedProperties;
