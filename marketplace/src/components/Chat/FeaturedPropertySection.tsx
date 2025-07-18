import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, MapPin, Bed, Bath, Square } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  address: string;
  city: string;
  province: string;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  square_feet?: number;
  status: string;
  images?: string[];
}

interface FeaturedPropertySectionProps {
  featuredProperties: Property[];
  onRemove: (propertyId: string) => void;
}

const FeaturedPropertySection = ({ featuredProperties, onRemove }: FeaturedPropertySectionProps) => {
  if (!featuredProperties || featuredProperties.length === 0) return null;

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

  return (
    <div className="border rounded-lg p-3 bg-blue-50 border-blue-200 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-blue-800">
          Featured Properties ({featuredProperties.length})
        </span>
      </div>
      
      <div className="space-y-3">
        {featuredProperties.map((property, index) => (
          <div key={property.id} className="flex items-center space-x-3 p-2 bg-white rounded border">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                {index + 1}
              </div>
            </div>
            
            {property.images && property.images.length > 0 ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-12 h-12 object-cover rounded-md"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                <span className="text-gray-400 text-xs">No image</span>
              </div>
            )}
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm truncate">{property.title}</h4>
                <Badge className={getStatusColor(property.status)} variant="secondary">
                  {property.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center text-xs text-gray-600">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">{property.address}, {property.city}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-primary">
                  {formatPrice(property.price)}
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
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
                </div>
              </div>
            </div>
            
            <Button
              onClick={() => onRemove(property.id)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-gray-600 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedPropertySection;