import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Eye, MapPin, Calendar, User, Bed, Bath, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

const AdminProperties = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<{id: string, title: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: properties, isLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          neighbourhoods(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch agent profiles separately
      const propertiesWithProfiles = await Promise.all(
        data.map(async (property) => {
          if (!property.agent_id) {
            return { ...property, agent_profile: null };
          }
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', property.agent_id)
            .single();
            
          return { ...property, agent_profile: profile };
        })
      );
      
      return propertiesWithProfiles;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete property: " + error.message,
        variant: "destructive",
      });
    }
  });

  const handleDeleteClick = (property: any) => {
    setPropertyToDelete({
      id: property.id,
      title: property.title
    });
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (!propertyToDelete) return;
    deleteMutation.mutate(propertyToDelete.id);
    setPropertyToDelete(null);
  };

  const filteredProperties = properties?.filter(property =>
    property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.neighbourhoods?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.agent_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading properties...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Property Management</h1>
          <p className="text-muted-foreground">
            Manage all property listings in the system
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <Input
          placeholder="Search properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{properties?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Total Properties</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {properties?.filter(p => p.status === 'for_sale').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">For Sale</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {properties?.filter(p => p.status === 'for_rent').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">For Rent</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {properties?.filter(p => p.status === 'sold' || p.status === 'rented').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Sold/Rented</div>
          </CardContent>
        </Card>
      </div>

      {/* Properties List */}
      <div className="grid gap-4">
        {filteredProperties?.map((property) => (
          <Card key={property.id} className="overflow-hidden">
            <div className="flex">
              {property.images && property.images.length > 0 && (
                <div className="w-48 h-32 flex-shrink-0">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{property.title}</h3>
                      <Badge className={getStatusColor(property.status)}>
                        {property.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div className="text-2xl font-bold text-primary">
                      {formatPrice(property.price)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {property.city}
                        {property.neighbourhoods?.name && `, ${property.neighbourhoods.name}`}
                      </div>
                      {property.bedrooms && (
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          {property.bedrooms}
                        </div>
                      )}
                      {property.bathrooms && (
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4" />
                          {property.bathrooms}
                        </div>
                      )}
                      {property.interior_size_sqm && (
                        <div className="flex items-center gap-1">
                          <Square className="h-4 w-4" />
                          {property.interior_size_sqm} sqm
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {property.agent_profile && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {property.agent_profile.full_name || property.agent_profile.email}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDistanceToNow(new Date(property.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/properties/${property.id}`)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(property)}
                      className="text-destructive hover:text-destructive hover:bg-red-50"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        {filteredProperties?.length === 0 && (
          <Card className="p-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'No properties have been listed yet.'}
            </p>
          </Card>
        )}
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Property"
        description={`Are you sure you want to delete "${propertyToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
};

export default AdminProperties;