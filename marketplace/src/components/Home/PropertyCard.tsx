
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Square, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import BookmarkButton from '@/components/Properties/BookmarkButton';
import { useAuth } from '@/contexts/AuthContext';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    price: number;
    bedrooms?: number;
    bathrooms?: number;
    interior_size_sqm?: number;
    neighbourhood?: string;
    city: string;
    images?: string[];
    status: string;
    property_type: string;
  };
}

const PropertyCard = ({ property }: PropertyCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch neighbourhood name if neighbourhood ID exists
  const { data: neighbourhood } = useQuery({
    queryKey: ['neighbourhood', property.neighbourhood],
    queryFn: async () => {
      if (!property.neighbourhood) return null;
      const { data, error } = await supabase
        .from('neighbourhoods')
        .select('name')
        .eq('id', property.neighbourhood)
        .single();
      
      if (error) return null;
      return data;
    },
    enabled: !!property.neighbourhood,
  });

  const formatPrice = (price: number) => {
    return `RWF ${price.toLocaleString()}`;
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'for_sale':
        return 'bg-green-100 text-green-800';
      case 'for_rent':
        return 'bg-blue-100 text-blue-800';
      case 'sold':
        return 'bg-gray-100 text-gray-800';
      case 'rented':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'for_sale':
        return 'For Sale';
      case 'for_rent':
        return 'For Rent';
      case 'sold':
        return 'Sold';
      case 'rented':
        return 'Rented';
      default:
        return status;
    }
  };

  const handleCardClick = () => {
    navigate(`/properties/${property.id}`);
  };

  const mainImage = property.images && property.images.length > 0 
    ? property.images[0] 
    : '/placeholder.svg';

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
      <div onClick={handleCardClick}>
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={mainImage}
            alt={property.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          <div className="absolute top-3 left-3">
            <Badge className={getStatusBadgeColor(property.status)}>
              {getStatusLabel(property.status)}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-black/50 text-white border-0">
              {property.property_type}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                {property.title}
              </h3>
              <div className="flex items-center text-gray-600 text-sm mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                {neighbourhood?.name || 'Unknown'}, {property.city}
              </div>
            </div>

            <div className="text-2xl font-bold text-primary">
              {formatPrice(property.price)}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                {property.bedrooms && (
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    <span>{property.bedrooms}</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    <span>{property.bathrooms}</span>
                  </div>
                )}
                {property.interior_size_sqm && (
                  <div className="flex items-center">
                    <Square className="h-4 w-4 mr-1" />
                    <span>{property.interior_size_sqm}m²</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </div>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Button
          onClick={handleCardClick}
          variant="outline"
          size="sm"
          className="flex-1 mr-2"
        >
          View Details
        </Button>
        {user && (
          <BookmarkButton propertyId={property.id} size="sm" />
        )}
      </CardFooter>
    </Card>
  );
};

export default PropertyCard;
