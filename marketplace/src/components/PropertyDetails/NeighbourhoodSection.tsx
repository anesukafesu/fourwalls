
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NeighbourhoodSectionProps {
  neighbourhood: {
    id: string;
    name: string;
    description: string;
    featured_image_url?: string;
  };
}

const NeighbourhoodSection = ({ neighbourhood }: NeighbourhoodSectionProps) => {
  const navigate = useNavigate();

  const handleReadMore = () => {
    navigate(`/neighbourhoods/${neighbourhood.id}`);
  };

  const truncateDescription = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          About {neighbourhood.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {neighbourhood.featured_image_url && (
          <div className="w-full h-32 rounded-lg overflow-hidden">
            <img
              src={neighbourhood.featured_image_url}
              alt={neighbourhood.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <p className="text-gray-600 leading-relaxed">
          {truncateDescription(neighbourhood.description)}
        </p>
        
        <Button
          onClick={handleReadMore}
          variant="outline"
          className="w-full"
        >
          Learn More About {neighbourhood.name}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default NeighbourhoodSection;
