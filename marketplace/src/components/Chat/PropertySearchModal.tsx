
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Square } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Property } from '@/types/property';

interface PropertySearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  otherUserId: string | null;
  onSelectProperty: (property: Property) => void;
}

const PropertySearchModal = ({ open, onOpenChange, otherUserId, onSelectProperty }: PropertySearchModalProps) => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: properties, isLoading } = useQuery({
    queryKey: ['combined-properties', otherUserId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const userIds = [user.id];
      if (otherUserId && otherUserId !== user.id) {
        userIds.push(otherUserId);
      }
      
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('agent_id', userIds)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Property[];
    },
    enabled: !!user?.id && open,
  });

  const filteredProperties = properties?.filter(property =>
    property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.neighbourhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.city.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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

  const getOwnershipLabel = (property: Property) => {
    if (property.agent_id === user?.id) {
      return 'Your property';
    }
    return 'Their property';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Properties to Feature</DialogTitle>
        </DialogHeader>
        <Command>
          <CommandInput
            placeholder="Search properties..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList className="max-h-[400px]">
            {isLoading ? (
              <div className="py-6 text-center text-sm">Loading properties...</div>
            ) : filteredProperties.length === 0 ? (
              <CommandEmpty>No properties found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredProperties.map((property) => (
                  <CommandItem
                    key={property.id}
                    onSelect={() => {
                      onSelectProperty(property);
                      onOpenChange(false);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{property.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {getOwnershipLabel(property)}
                            </Badge>
                            <Badge className={getStatusColor(property.status)} variant="secondary">
                              {property.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{property.neighbourhood}, {property.city}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-primary">
                            {formatPrice(property.price)}
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-gray-600">
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
                            {property.interior_size_sqm && (
                              <div className="flex items-center">
                                <Square className="h-3 w-3 mr-1" />
                                <span>{property.interior_size_sqm} m²</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default PropertySearchModal;
