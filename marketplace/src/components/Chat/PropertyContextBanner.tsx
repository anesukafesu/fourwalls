
import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface PropertyContextBannerProps {
  propertyId: string;
  propertyTitle: string;
}

const PropertyContextBanner = ({ propertyId, propertyTitle }: PropertyContextBannerProps) => {
  return (
    <div className="bg-blue-50 border-b px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-blue-600 font-medium">Property:</span>
          <span className="text-blue-800">{decodeURIComponent(propertyTitle)}</span>
        </div>
        <Link 
          to={`/properties/${propertyId}`}
          className="flex items-center space-x-1 text-sm text-primary hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          <span>View Property</span>
        </Link>
      </div>
    </div>
  );
};

export default PropertyContextBanner;
