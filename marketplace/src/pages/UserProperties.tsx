
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Home, Edit, Trash2, Plus } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';
import { Property } from '@/types/property';

type PropertyStatus = Database['public']['Enums']['property_status'];

const UserProperties = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Fetch user's properties
  const { data: properties, isLoading } = useQuery({
    queryKey: ['user-properties', user?.id, filterStatus],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('properties')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus as PropertyStatus);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Property[];
    },
    enabled: !!user,
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      const { error } = await supabase.functions.invoke('delete-property-images', {
        body: { propertyId }
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-properties'] });
      toast.success('Property and all associated data deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete property: ' + error.message);
    },
  });

  // Update property status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ propertyId, status }: { propertyId: string; status: PropertyStatus }) => {
      const { error } = await supabase
        .from('properties')
        .update({ status })
        .eq('id', propertyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-properties'] });
      toast.success('Property status updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update property status: ' + error.message);
    },
  });

  const getStatusBadge = (status: PropertyStatus) => {
    const statusConfig = {
      for_sale: { label: 'For Sale', className: 'bg-green-100 text-green-800' },
      for_rent: { label: 'For Rent', className: 'bg-blue-100 text-blue-800' },
      sold: { label: 'Sold', className: 'bg-gray-100 text-gray-800' },
      rented: { label: 'Rented', className: 'bg-purple-100 text-purple-800' },
      off_market: { label: 'Off Market', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleStatusChange = (propertyId: string, newStatus: string) => {
    updateStatusMutation.mutate({ 
      propertyId, 
      status: newStatus as PropertyStatus 
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="for_sale">For Sale</SelectItem>
                <SelectItem value="for_rent">For Rent</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
                <SelectItem value="off_market">Off Market</SelectItem>
              </SelectContent>
            </Select>
            
            <Button onClick={() => navigate('/properties/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </div>
        </div>

        {/* Properties List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your properties...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties?.map((property) => (
              <Card key={property.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="truncate text-lg">{property.title}</CardTitle>
                    {getStatusBadge(property.status as PropertyStatus)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-primary">{formatPrice(property.price)}</p>
                    <p className="text-gray-600">{property.neighbourhood}, {property.city}</p>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <p>{property.bedrooms} bed • {property.bathrooms} bath • {property.interior_size_sqm} sq m</p>
                    <p className="capitalize">{property.property_type}</p>
                  </div>
                  
                  <p className="text-gray-600 line-clamp-2">{property.description}</p>
                  
                  <div className="space-y-2">
                    <Select onValueChange={(value) => handleStatusChange(property.id, value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Change Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="for_sale">For Sale</SelectItem>
                        <SelectItem value="for_rent">For Rent</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                        <SelectItem value="off_market">Off Market</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/properties/${property.id}/edit`)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deletePropertyMutation.mutate(property.id)}
                        className="flex-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
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
              {filterStatus === 'all' 
                ? "You haven't created any properties yet." 
                : `No properties found with status: ${filterStatus}`}
            </p>
            <Button onClick={() => navigate('/properties/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Property
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProperties;
