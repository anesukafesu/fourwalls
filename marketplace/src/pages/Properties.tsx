
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PropertyCard from "@/components/Home/PropertyCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Filter } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Database } from "@/integrations/supabase/types";
import UnifiedSearchForm from "@/components/Search/UnifiedSearchForm";

type PropertyType = Database["public"]["Enums"]["property_type"];
type PropertyStatus = Database["public"]["Enums"]["property_status"];

const Properties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract search params
  const query = searchParams.get("query") || "";
  const neighbourhood = searchParams.get("neighbourhood") || "";
  const propertyType = searchParams.get("propertyType") || "";
  const status = searchParams.get("status") || "";
  const bedrooms = searchParams.get("bedrooms") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const preferredSearchMethod = searchParams.get("preferredSearchMethod")

  const { data: properties, isLoading } = useQuery({
    queryKey: [
      "properties",
      query,
      neighbourhood,
      propertyType,
      status,
      bedrooms,
      minPrice,
      maxPrice,
    ],
    queryFn: async () => {
      let query_builder = supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (query) {
        query_builder = query_builder.or(
          `title.ilike.%${query}%,description.ilike.%${query}%`
        );
      }

      if (neighbourhood) {
        query_builder = query_builder.eq("neighbourhood", neighbourhood);
      }

      if (propertyType && propertyType !== "all") {
        query_builder = query_builder.eq(
          "property_type",
          propertyType as PropertyType
        );
      }

      if (status && status !== "all") {
        query_builder = query_builder.eq("status", status as PropertyStatus);
      }

      if (bedrooms && bedrooms !== "all") {
        if (bedrooms === "5+") {
          query_builder = query_builder.gte("bedrooms", 5);
        } else {
          query_builder = query_builder.eq("bedrooms", parseInt(bedrooms));
        }
      }

      if (minPrice) {
        query_builder = query_builder.gte("price", parseInt(minPrice));
      }

      if (maxPrice) {
        query_builder = query_builder.lte("price", parseInt(maxPrice));
      }

      const { data, error } = await query_builder;
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
          {user && (
            <Button onClick={() => navigate("/properties/create")}>
              <Plus className="h-4 w-4 mr-2" />
              List Property
            </Button>
          )}
        </div>
        <UnifiedSearchForm variant="page" preferredSearchMethod={preferredSearchMethod as "filter" | "ai"} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-sm h-96 animate-pulse"
              >
                <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                <div className="p-6 space-y-3">
                  <div className="bg-gray-200 h-6 rounded"></div>
                  <div className="bg-gray-200 h-4 rounded w-2/3"></div>
                  <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search filters or browse all properties.
            </p>
            {user && (
              <Button onClick={() => navigate("/properties/create")}>
                List Your Property
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
