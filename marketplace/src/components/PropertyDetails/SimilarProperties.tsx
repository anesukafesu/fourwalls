
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import PropertyCard from "@/components/Home/PropertyCard";

interface SimilarPropertiesProps {
  currentPropertyId: string;
  propertyType: string;
  city: string;
}

const SimilarProperties = ({ currentPropertyId, propertyType, city }: SimilarPropertiesProps) => {
  const { data: similarProperties, isLoading } = useQuery({
    queryKey: ["similar-properties", currentPropertyId, propertyType, city],
    queryFn: async () => {
      try {
        // Get similar properties based on type and city, excluding current property
        const { data: properties, error } = await supabase
          .from("properties")
          .select("*")
          .eq("property_type", propertyType)
          .eq("city", city)
          .neq("id", currentPropertyId)
          .in("status", ["for_sale", "for_rent"])
          .limit(6);

        if (error) throw error;
        return properties || [];
      } catch (error) {
        console.error("Error fetching similar properties:", error);
        return [];
      }
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Similar Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!similarProperties || similarProperties.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Similar Properties</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {similarProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
};

export default SimilarProperties;
