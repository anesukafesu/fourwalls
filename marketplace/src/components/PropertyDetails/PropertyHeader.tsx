
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface PropertyHeaderProps {
  title: string;
  neighbourhood?: string;
  city: string;
  price: number;
  status: string;
}

const PropertyHeader = ({ title, neighbourhood, city, price, status }: PropertyHeaderProps) => {
  const formatPrice = (price: number) => {
    return `RWF ${price.toLocaleString('en-US')}`;
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
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>
              {neighbourhood && `${neighbourhood}, `}{city}
            </span>
          </div>
        </div>
        <Badge className={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>
      
      <div className="border-b pb-4">
        <p className="text-2xl font-bold text-primary">
          {formatPrice(price)}
        </p>
      </div>
    </div>
  );
};

export default PropertyHeader;
