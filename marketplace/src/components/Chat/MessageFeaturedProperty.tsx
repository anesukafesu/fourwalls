
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Property {
  id: string;
  title: string;
  price: number;
  city: string;
  neighbourhood?: string;
  status: string;
  bedrooms?: number;
  bathrooms?: number;
  interior_size_sqm?: number;
  property_type: string;
  images?: string[];
  neighbourhoods?: {
    name: string;
  };
}

interface MessageFeaturedPropertyProps {
  property: Property;
}

const MessageFeaturedProperty = ({ property }: MessageFeaturedPropertyProps) => {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      for_sale: { label: 'For Sale', className: 'bg-green-100 text-green-800' },
      for_rent: { label: 'For Rent', className: 'bg-blue-100 text-blue-800' },
      sold: { label: 'Sold', className: 'bg-gray-100 text-gray-800' },
      rented: { label: 'Rented', className: 'bg-purple-100 text-purple-800' },
      off_market: { label: 'Off Market', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge className={config?.className}>{config?.label || status}</Badge>;
  };

  return (
    <Card 
      className="max-w-md cursor-pointer hover:shadow-md transition-shadow bg-white border"
      onClick={() => navigate(`/properties/${property.id}`)}
    >
      <div className="flex">
        {/* Image */}
        <div className="w-24 h-24 flex-shrink-0">
          {property.images && property.images.length > 0 ? (
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-full object-cover rounded-l-lg"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-l-lg flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="flex-1 p-3">
          <div className="space-y-1">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-sm text-gray-900 truncate pr-2">
                {property.title}
              </h4>
              {getStatusBadge(property.status)}
            </div>
            
            <p className="text-primary font-semibold text-sm">
              {formatPrice(property.price)}
            </p>
            
            <div className="flex items-center text-xs text-gray-600">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">
                {property.neighbourhoods?.name || 'Unknown'}, {property.city}
              </span>
            </div>
            
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              {property.bedrooms && (
                <div className="flex items-center">
                  <Bed className="h-3 w-3 mr-1" />
                  {property.bedrooms}
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center">
                  <Bath className="h-3 w-3 mr-1" />
                  {property.bathrooms}
                </div>
              )}
              {property.interior_size_sqm && (
                <div className="flex items-center">
                  <Square className="h-3 w-3 mr-1" />
                  {property.interior_size_sqm}m²
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default MessageFeaturedProperty;
