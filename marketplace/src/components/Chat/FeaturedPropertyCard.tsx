
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Square, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FeaturedPropertyCardProps {
  propertyId: string;
}

const FeaturedPropertyCard = ({ propertyId }: FeaturedPropertyCardProps) => {
  const { data: property, isLoading } = useQuery({
    queryKey: ['featured-property', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!propertyId,
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'for_sale':
        return 'bg-green-100 text-green-800';
      case 'for_rent':
        return 'bg-blue-100 text-blue-800';
      case 'sold':
        return 'bg-gray-100 text-gray-800';
      case 'rented':
        return 'bg-purple-100 text-purple-800';
      case 'off_market':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!property) {
    return (
      <Card className="w-full max-w-sm border-red-200">
        <CardContent className="p-4">
          <p className="text-red-600 text-sm">Property not found</p>
        </CardContent>
      </Card>
    );
  }

  const mainImage = property.images && property.images.length > 0 ? property.images[0] : null;

  return (
    <Card className="w-full max-w-sm border shadow-sm">
      <CardContent className="p-0">
        {/* Property Image */}
        <div className="relative">
          {mainImage ? (
            <img
              src={mainImage}
              alt={property.title}
              className="w-full h-32 object-cover rounded-t-lg"
            />
          ) : (
            <div className="w-full h-32 bg-gray-200 rounded-t-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge className={getStatusColor(property.status)} variant="secondary">
              {property.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Property Info */}
        <div className="p-4 space-y-3">
          <div>
            <h4 className="font-semibold text-sm mb-1 line-clamp-1">{property.title}</h4>
            <div className="flex items-center text-xs text-gray-600 mb-2">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="line-clamp-1">{property.neighbourhood}, {property.city}</span>
            </div>
            <div className="text-lg font-bold text-primary">{formatPrice(property.price)}</div>
          </div>

          {/* Property Details */}
          <div className="flex items-center space-x-4 text-xs text-gray-600">
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

          {/* View Property Button */}
          <Link to={`/properties/${property.id}`}>
            <Button variant="outline" size="sm" className="w-full">
              <ExternalLink className="h-3 w-3 mr-2" />
              View Property
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturedPropertyCard;
