
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import ReactMarkdown from 'react-markdown';

const NeighbourhoodSnapshot = () => {
  const { data: neighbourhoods, isLoading } = useQuery({
    queryKey: ["featured-neighbourhoods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("neighbourhoods")
        .select("*")
        .limit(4)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#111827] mb-4">Featured Neighbourhoods</h2>
          <p className="text-xl text-gray-600 mb-8">Discover the best areas in Kigali</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!neighbourhoods || neighbourhoods.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#111827] mb-4">Featured Neighbourhoods</h2>
          <p className="text-xl text-gray-600 mb-8">Discover the best areas in Kigali</p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">
              No neighbourhoods available yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#111827] mb-4">Featured Neighbourhoods</h2>
        <p className="text-xl text-gray-600 mb-8">Discover the best areas in Kigali</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="prose prose-sm max-w-none mb-4">
                <ReactMarkdown>
                  {neighbourhood.description?.substring(0, 200) + (neighbourhood.description?.length > 200 ? '...' : '') || "Discover what makes this neighbourhood special."}
                </ReactMarkdown>
              </div>
              <Link to={`/neighbourhoods/${neighbourhood.id}`}>
                <Button variant="outline" className="w-full">
                  Learn More <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="text-center">
        <Link to="/neighbourhoods">
          <Button variant="outline">
            View All Neighbourhoods <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NeighbourhoodSnapshot;
