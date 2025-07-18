
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PropertySummaryCardProps {
  property: any;
}

const PropertySummaryCard = ({ property }: PropertySummaryCardProps) => {
  const formatPrice = (price: number) => {
    return `RWF ${price.toLocaleString('en-US')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <Badge variant="outline" className="capitalize">
            {property.status.replace('_', ' ')}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Type:</span>
          <span className="capitalize">{property.property_type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Price:</span>
          <span className="font-semibold">{formatPrice(property.price)}</span>
        </div>
        {property.bedrooms && (
          <div className="flex justify-between">
            <span className="text-gray-600">Bedrooms:</span>
            <span>{property.bedrooms}</span>
          </div>
        )}
        {property.bathrooms && (
          <div className="flex justify-between">
            <span className="text-gray-600">Bathrooms:</span>
            <span>{property.bathrooms}</span>
          </div>
        )}
        {property.interior_size_sqm && (
          <div className="flex justify-between">
            <span className="text-gray-600">Square Meters:</span>
            <span>{property.interior_size_sqm.toLocaleString()}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertySummaryCard;
