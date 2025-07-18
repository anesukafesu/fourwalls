
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Plus, Facebook } from 'lucide-react';
import AnalyticsCards from '@/components/MyProperties/AnalyticsCards';
import TopPropertiesLeaderboard from '@/components/MyProperties/TopPropertiesLeaderboard';

const MyProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['my-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          neighbourhoods (
            id,
            name
          )
        `)
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('rw-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your properties.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <Home className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button onClick={() => navigate('/properties/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>

        {/* Analytics Cards */}
        <AnalyticsCards />

        {/* Top Properties Leaderboard */}
        <TopPropertiesLeaderboard />

        {/* Properties List */}
        <Card>
          <CardHeader>
            <CardTitle>All Properties</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your properties...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties?.map((property) => (
                  <Card key={property.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigate(`/properties/${property.id}`)}>
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="truncate text-lg">{property.title}</CardTitle>
                        {getStatusBadge(property.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-2xl font-bold text-primary">{formatPrice(property.price)}</p>
                        <p className="text-gray-600">
                          {property.neighbourhoods?.name || 'Unknown'}, {property.city}
                        </p>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        <p>{property.bedrooms} bed • {property.bathrooms} bath • {property.interior_size_sqm} sq m</p>
                        <p className="capitalize">{property.property_type?.replace('_', ' ')}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {properties && properties.length === 0 && (
              <div className="text-center py-12">
                <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Found</h3>
                <p className="text-gray-600 mb-6">
                  You haven't created any properties yet. Get started by adding a property or importing from Facebook.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={() => navigate('/properties/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Property
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/facebook-imports')}
                  >
                    <Facebook className="h-4 w-4 mr-2" />
                    Import from Facebook
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyProperties;
