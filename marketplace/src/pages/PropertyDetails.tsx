
import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import BookmarkButton from '@/components/Properties/BookmarkButton';
import { useAuth } from '@/contexts/AuthContext';
import PropertyHeader from '@/components/PropertyDetails/PropertyHeader';
import PropertyImageGallery from '@/components/PropertyDetails/PropertyImageGallery';
import PropertyDetailsCard from '@/components/PropertyDetails/PropertyDetailsCard';
import AgentContactCard from '@/components/PropertyDetails/AgentContactCard';
import ListingManagementCard from '@/components/PropertyDetails/ListingManagementCard';
import NeighbourhoodSection from '@/components/PropertyDetails/NeighbourhoodSection';
import { usePropertyViewTracking } from '@/hooks/usePropertyViewTracking';
import RecommendedProperties from '@/components/PropertyDetails/RecommendedProperties';
import RelatedProperties from '@/components/PropertyDetails/RelatedProperties';

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { trackPropertyView } = usePropertyViewTracking();

  const { data: property, isLoading } = useQuery({
    queryKey: ['property-details', id],
    queryFn: async () => {
      if (!id) throw new Error('Property ID is required');
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          neighbourhoods (
            id,
            name,
            description,
            featured_image_url
          )
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (property?.id) {
      trackPropertyView(property.id, property.agent_id);
    }
  }, [property]);

  const { data: agent } = useQuery({
    queryKey: ['agent-details', property?.agent_id],
    queryFn: async () => {
      if (!property?.agent_id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, bio')
        .eq('id', property.agent_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!property?.agent_id,
  });

  const { data: agentRating } = useQuery({
    queryKey: ['agent-average-rating', property?.agent_id],
    queryFn: async () => {
      if (!property?.agent_id) return null;
      const { data, error } = await supabase.rpc('get_user_average_rating', {
        user_id: property.agent_id,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!property?.agent_id,
  });

  const { data: bookmarkCount } = useQuery({
    queryKey: ['bookmark-count', property?.id],
    queryFn: async () => {
      if (!property?.id) return 0;
      const { count, error } = await supabase
        .from('property_bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', property.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!property?.id,
  });

  const { data: viewsCount } = useQuery({
    queryKey: ['property-views-count', property?.id],
    queryFn: async () => {
      if (!property?.id) return 0;
      const { count, error } = await supabase
        .from('property_views')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', property.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!property?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!property?.id) throw new Error('No property ID');
      const { error } = await supabase.from('properties').delete().eq('id', property.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      navigate('/properties');
    },
    onError: (error) => {
      alert('Failed to delete property: ' + (error as Error).message);
    },
  });

  const handleEditProperty = () => {
    navigate(`/properties/${property?.id}/edit`);
  };

  const handleSignInToContact = () => {
    const currentUrl = window.location.pathname;
    navigate(`/auth?redirect_url=${encodeURIComponent(currentUrl)}`);
  };

  const handleAgentClick = () => {
    if (agent?.id) {
      navigate(`/profile/${agent.id}`);
    }
  };

  const handleBackClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/properties');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Property not found</p>
            <Button onClick={() => navigate('/properties')}>
              Back to Properties
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const images = property.images || [];
  const isAgent = user?.id === property.agent_id;
  const isOtherUser = user && !isAgent;
  const isNotSignedIn = !user;
  const neighbourhood = property.neighbourhoods;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={handleBackClick}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-3 space-y-6">
            <PropertyHeader
              title={property.title}
              neighbourhood={neighbourhood?.name || 'Unknown'}
              city={property.city}
              price={property.price}
              status={property.status}
            />

            <PropertyImageGallery 
              images={images} 
              title={property.title}
              propertyId={property.id}
              propertyType={property.property_type}
              city={property.city}
            />

            <PropertyDetailsCard property={property} />

            {/* Neighbourhood Section */}
            {neighbourhood && (
              <NeighbourhoodSection neighbourhood={neighbourhood} />
            )}

            <RelatedProperties propertyId={property.id} />

            {/* Listing Management Card - Only for Property Owner */}
            {isAgent && (
              <ListingManagementCard 
                property={property}
                viewsCount={viewsCount}
                bookmarkCount={bookmarkCount}
                onEdit={handleEditProperty}
                onDelete={() => {
                  if (window.confirm('Are you sure you want to delete this property?')) {
                    deleteMutation.mutate();
                  }
                }}
                isDeleting={deleteMutation.isPending}
              />
            )}

            <RecommendedProperties propertyId={property.id} />
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {agent && (
              <AgentContactCard
                agent={agent}
                agentRating={agentRating}
                propertyId={property.id}
                propertyTitle={property.title}
                agentId={property.agent_id}
                isOtherUser={isOtherUser}
                isNotSignedIn={isNotSignedIn}
                onSignInToContact={handleSignInToContact}
                onAgentClick={handleAgentClick}
              />
            )}

            {isOtherUser && (
              <Card>
                <CardHeader>
                  <CardTitle>Save Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <BookmarkButton propertyId={property.id} size="default" variant="outline" />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
