import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Eye,
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePropertyAnalytics } from "@/hooks/usePropertyAnalytics";
import PropertyViewsChart from "./PropertyViewsChart";

interface ListingManagementCardProps {
  property: any;
  viewsCount: number;
  bookmarkCount: number;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

const ListingManagementCard = ({
  property,
  viewsCount,
  bookmarkCount,
  onEdit,
  onDelete,
  isDeleting,
}: ListingManagementCardProps) => {
  const { topProperties } = usePropertyAnalytics();

  // Get property ranking
  const propertyRanking =
    topProperties?.findIndex((p) => p.id === property.id) + 1 || 0;

  // Get image counts by aspect
  const { data: imageData } = useQuery({
    queryKey: ["property-images-analysis", property.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("property_images")
        .select("aspect")
        .eq("property_id", property.id);

      if (error) throw error;

      const exteriorCount =
        data?.filter((img) => img.aspect === "exterior").length || 0;
      const interiorCount =
        data?.filter((img) => img.aspect === "interior").length || 0;

      return { exteriorCount, interiorCount };
    },
    enabled: !!property.id,
  });

  // Calculate listing health
  const getListingHealth = () => {
    const checks = [
      property.title?.length > 0,
      property.description?.length >= 300,
      property.bedrooms != null,
      property.bathrooms != null,
      property.interior_size_sqm != null,
      imageData?.exteriorCount >= 3,
      imageData?.interiorCount >= 7,
      property.features?.length > 0,
    ];

    const completedCount = checks.filter(Boolean).length;
    const percentage = (completedCount / checks.length) * 100;

    if (percentage >= 80)
      return { status: "healthy", color: "bg-green-100 text-green-800" };
    if (percentage >= 50)
      return { status: "average", color: "bg-yellow-100 text-yellow-800" };
    return { status: "poor", color: "bg-red-100 text-red-800" };
  };

  const listingHealth = getListingHealth();

  const improvementChecks = [
    {
      label: "Complete title",
      completed: property.title?.length > 0,
      description: "Property has a descriptive title",
    },
    {
      label: "Detailed description (300+ chars)",
      completed: property.description?.length >= 300,
      description: `Current: ${property.description?.length || 0} characters`,
    },
    {
      label: "Bedrooms specified",
      completed: property.bedrooms != null,
      description: "Number of bedrooms is specified",
    },
    {
      label: "Bathrooms specified",
      completed: property.bathrooms != null,
      description: "Number of bathrooms is specified",
    },
    {
      label: "Interior size specified",
      completed: property.interior_size_sqm != null,
      description: "Interior square meters specified",
    },
    {
      label: "Sufficient exterior images (3+)",
      completed: (imageData?.exteriorCount || 0) >= 3,
      description: `Current: ${imageData?.exteriorCount || 0} exterior images`,
    },
    {
      label: "Sufficient interior images (7+)",
      completed: (imageData?.interiorCount || 0) >= 7,
      description: `Current: ${imageData?.interiorCount || 0} interior images`,
    },
    {
      label: "Property features listed",
      completed: (property.features?.length || 0) > 0,
      description: `Current: ${property.features?.length || 0} features`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Listing Management</span>
          </CardTitle>
          <Badge className={listingHealth.color}>{listingHealth.status}</Badge>
        </div>
        <p className="text-sm text-gray-600">
          Only you can view this section because you own this property.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Total Views:</span>
            </div>
            <span className="font-medium text-lg">{viewsCount || 0}</span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Bookmarks:</span>
            </div>
            <span className="font-medium text-lg">{bookmarkCount || 0}</span>
          </div>
        </div>

        {propertyRanking > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Ranking:</strong> #{propertyRanking} in your property
              leaderboard
            </p>
          </div>
        )}

        {/* Views Chart */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Views - Last 7 Days</h4>
          <PropertyViewsChart propertyId={property.id} />
        </div>

        {/* Improvement Checklist */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Listing Improvements</h4>
          <div className="space-y-2">
            {improvementChecks.map((check, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50"
              >
                {check.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {check.label}
                  </p>
                  <p className="text-xs text-gray-500">{check.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t">
          <Button onClick={onEdit} variant="outline" className="flex-1">
            <Edit className="h-4 w-4 mr-2" />
            Edit Property
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            disabled={isDeleting}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete Property"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListingManagementCard;
