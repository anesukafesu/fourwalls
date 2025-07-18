
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bed, Bath, Square, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface PropertyDetailsCardProps {
  property: any;
}

const PropertyDetailsCard = ({ property }: PropertyDetailsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {property.bedrooms && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Bed className="h-5 w-5 mr-1" />
                <span className="text-xl font-bold">{property.bedrooms}</span>
              </div>
              <div className="text-sm text-gray-600">Bedrooms</div>
            </div>
          )}
          {property.bathrooms && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Bath className="h-5 w-5 mr-1" />
                <span className="text-xl font-bold">{property.bathrooms}</span>
              </div>
              <div className="text-sm text-gray-600">Bathrooms</div>
            </div>
          )}
          {property.square_feet && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Square className="h-5 w-5 mr-1" />
                <span className="text-xl font-bold">{property.square_feet.toLocaleString()}</span>
              </div>
              <div className="text-sm text-gray-600">Sq Meters</div>
            </div>
          )}
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Calendar className="h-5 w-5 mr-1" />
              <span className="text-xl font-bold">{format(new Date(property.created_at), 'MMM yyyy')}</span>
            </div>
            <div className="text-sm text-gray-600">Listed</div>
          </div>
        </div>

        {property.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{property.description}</p>
          </div>
        )}

        {property.features && property.features.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Features</h3>
            <div className="flex flex-wrap gap-2">
              {property.features.map((feature: string, index: number) => (
                <Badge key={index} variant="secondary">{feature}</Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Property Type:</span> {property.property_type}
          </div>
          {property.year_built && (
            <div>
              <span className="font-medium">Year Built:</span> {property.year_built}
            </div>
          )}
          {property.lot_size && (
            <div>
              <span className="font-medium">Lot Size:</span> {property.lot_size} sq meters
            </div>
          )}
          <div>
            <span className="font-medium">Listed:</span> {format(new Date(property.created_at), 'PPP')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyDetailsCard;
