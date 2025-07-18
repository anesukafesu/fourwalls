
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const NeighbourhoodDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data: neighbourhood, isLoading } = useQuery({
    queryKey: ['neighbourhood-details', id],
    queryFn: async () => {
      if (!id) throw new Error('Neighbourhood ID is required');
      const { data, error } = await supabase
        .from('neighbourhoods')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: properties } = useQuery({
    queryKey: ['neighbourhood-properties', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('neighbourhood', id)
        .eq('status', 'for_sale')
        .limit(6);

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading neighbourhood details...</p>
        </div>
      </div>
    );
  }

  if (!neighbourhood) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Neighbourhood not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <MapPin className="h-6 w-6 text-primary mr-2" />
            <h1 className="text-3xl font-bold text-gray-900">{neighbourhood.name}</h1>
          </div>
          
          {neighbourhood.featured_image_url && (
            <div className="mb-6">
              <img
                src={neighbourhood.featured_image_url}
                alt={neighbourhood.name}
                className="w-full h-64 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>About {neighbourhood.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {neighbourhood.description ? (
                  <div className="prose max-w-none">
                    <ReactMarkdown>{neighbourhood.description}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No description available for this neighbourhood yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Properties in {neighbourhood.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {properties && properties.length > 0 ? (
                  <div className="space-y-4">
                    {properties.map((property) => (
                      <div
                        key={property.id}
                        className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => window.location.href = `/properties/${property.id}`}
                      >
                        <h4 className="font-medium text-gray-900 truncate">{property.title}</h4>
                        <p className="text-primary font-semibold">
                          RWF {property.price.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {property.bedrooms} bed • {property.bathrooms} bath
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    No properties currently available in this neighbourhood.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NeighbourhoodDetails;
