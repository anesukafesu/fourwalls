import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const BookmarksSnippet = () => {
  const { user } = useAuth();

  const { data: bookmarkedProperties, isLoading } = useQuery({
    queryKey: ["bookmarked-properties-snippet", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Step 1: Get bookmarks
      const { data: bookmarks, error } = await supabase
        .from("property_bookmarks")
        .select("property_id, id, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(30);

      if (error) throw error;
      if (!bookmarks || bookmarks.length === 0) return [];
      const propertyIds = bookmarks.map((b) => b.property_id);

      // Step 2: Get properties
      const { data: properties, error: propError } = await supabase
        .from("properties")
        .select("*")
        .in("id", propertyIds);

      if (propError) throw propError;
      // Optionally, sort properties to match the order of bookmarks
      const propertyMap = Object.fromEntries(
        (properties || []).map((p) => [p.id, p])
      );
      return propertyIds.map((id) => propertyMap[id]).filter(Boolean);
    },
    enabled: !!user?.id,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "for_sale":
        return "bg-green-100 text-green-800";
      case "for_rent":
        return "bg-blue-100 text-blue-800";
      case "sold":
        return "bg-gray-100 text-gray-800";
      case "rented":
        return "bg-purple-100 text-purple-800";
      case "off_market":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Your Bookmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex space-x-4 animate-pulse">
                <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!bookmarkedProperties || bookmarkedProperties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Your Bookmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 text-center py-8">
            You haven't bookmarked any properties yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bookmark className="h-5 w-5" />
          Your Bookmarks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookmarkedProperties.map((property) => (
            <Link
              key={property.id}
              to={`/properties/${property.id}`}
              className="flex space-x-4 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {property.images && property.images.length > 0 ? (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">No image</span>
                </div>
              )}
              <div className="flex-1 space-y-1">
                <h4 className="font-medium text-sm line-clamp-2">
                  {property.title}
                </h4>
                <div className="flex items-center text-xs text-gray-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>
                    {property.neighbourhood}, {property.city}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-primary">
                    {formatPrice(property.price)}
                  </div>
                  <Badge
                    className={getStatusColor(property.status)}
                    variant="secondary"
                  >
                    {property.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center space-x-3 text-xs text-gray-600">
                  {property.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="h-3 w-3 mr-1" />
                      <span>{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="h-3 w-3 mr-1" />
                      <span>{property.bathrooms}</span>
                    </div>
                  )}
                  {property.interior_size_sqm && (
                    <div className="flex items-center">
                      <Square className="h-3 w-3 mr-1" />
                      <span>{property.interior_size_sqm} m²</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <Link to="/bookmarks">
            <Button variant="outline" className="w-full">
              View All Bookmarks
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookmarksSnippet;
