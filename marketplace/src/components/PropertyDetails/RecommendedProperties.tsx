import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PropertyCard from "@/components/Home/PropertyCard";

interface RecommendedPropertiesProps {
  propertyId: string;
}

const RecommendedProperties = ({ propertyId }: RecommendedPropertiesProps) => {
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ["property-recommendations", propertyId],
    queryFn: async () => {
      try {
        const response = await fetch(
          `https://akafesu-fourwalls-recommendations-api.hf.space/recommendations/${propertyId}`
        );

        if (!response.ok) throw new Error("Failed to fetch recommendations");

        const { recommended_ids: recommendedIds } = await response.json();

        // Fetch property details for recommended IDs
        if (recommendedIds && recommendedIds.length > 0) {
          const { data: properties, error } = await supabase
            .from("properties")
            .select("*")
            .in("id", recommendedIds)
            .limit(4);

          if (error) throw error;
          return properties || [];
        }

        return [];
      } catch (error) {
        console.error("Error fetching property recommendations:", error);
        return [];
      }
    },
    enabled: !!propertyId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>You might also like</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Finding similar properties...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>You might also like</CardTitle>
        <p className="text-gray-600">
          Similar properties you might be interested in
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendedProperties;
