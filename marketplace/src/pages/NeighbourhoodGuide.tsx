
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function NeighbourhoodGuide () {
  const { data: neighbourhoods, isLoading } = useQuery({
    queryKey: ["neighbourhoods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("neighbourhoods")
        .select("*")
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#111827] mb-4">
              Neighbourhood Guide
            </h1>
            <p className="text-gray-600">
              Discover the best neighbourhoods in Kigali
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <Card>
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111827] mb-4">
            Neighbourhood Guide
          </h1>
          <p className="text-gray-600">
            Discover the best neighbourhoods in Kigali and find your perfect location
          </p>
        </div>

        {!neighbourhoods || neighbourhoods.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No neighbourhoods available
              </h3>
              <p className="text-gray-600">
                Neighbourhood information will be available soon.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {neighbourhoods.map((neighbourhood) => (
              <Card key={neighbourhood.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {neighbourhood.featured_image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={neighbourhood.featured_image_url}
                      alt={neighbourhood.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-[#111827] flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                    {neighbourhood.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {neighbourhood.description || "Discover what makes this neighbourhood special."}
                  </p>
                  <Link to={`/neighbourhoods/${neighbourhood.id}`}>
                    <Button variant="outline" className="w-full">
                      Learn More <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NeighbourhoodGuide;
