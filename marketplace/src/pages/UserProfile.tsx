
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Phone, Mail, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AgentReviews from '@/components/UserProfile/AgentReviews';
import AgentProperties from '@/components/UserProfile/AgentProperties';

const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // Check if user is an agent (has properties)
  const { data: isAgent } = useQuery({
    queryKey: ['user-agent-status', userId],
    queryFn: async () => {
      if (!userId) return false;
      const { data, error } = await supabase
        .from('properties')
        .select('id')
        .eq('agent_id', userId)
        .limit(1);
      if (error) return false;
      return data && data.length > 0;
    },
    enabled: !!userId,
  });

  // Get user average rating (only for agents)
  const { data: averageRating } = useQuery({
    queryKey: ['user-average-rating', userId],
    queryFn: async () => {
      if (!userId || !isAgent) return null;
      const { data, error } = await supabase.rpc('get_user_average_rating', {
        user_id: userId,
      });
      if (error) throw error;
      return data;
    },
    enabled: !!userId && !!isAgent,
  });

  // Get total review count for agents
  const { data: reviewCount } = useQuery({
    queryKey: ['user-review-count', userId],
    queryFn: async () => {
      if (!userId || !isAgent) return 0;
      const { count, error } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('reviewed_user_id', userId);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!userId && !!isAgent,
  });

  const renderStars = (rating: number, size = 'h-4 w-4') => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`${size} ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  // Fix the current user check - compare the user ID from params with current user ID
  const isOwnProfile = currentUser && currentUser.id === userId;

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">User not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* User Profile Card */}
      <Card className="mb-8">
        <CardContent className="py-6">
          <div className="flex items-start space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name || ''} />
              <AvatarFallback className="text-2xl">
                {profile.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{profile.full_name || 'Unknown User'}</h1>
                  <div className="flex items-center space-x-2 mt-1">
                    {profile.pronouns && (
                      <Badge variant="secondary">
                        {profile.pronouns}
                      </Badge>
                    )}
                    {isAgent && (
                      <Badge variant="outline" className="text-primary">
                        Real Estate Agent
                      </Badge>
                    )}
                  </div>
                </div>
                {isOwnProfile && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/manage-profile')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Profile
                  </Button>
                )}
              </div>
              
              {isAgent && averageRating && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {renderStars(Math.round(averageRating))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {averageRating}/5 ({reviewCount || 0} reviews)
                  </span>
                </div>
              )}

              <div className="space-y-2">
                {profile.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{profile.email}</span>
                  </div>
                )}
                {profile.phone_number && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{profile.phone_number}</span>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>

              {profile.bio && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-gray-700">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Sections */}
      {isAgent && (
        <div className="space-y-8">
          {/* Reviews Section */}
          <AgentReviews agentId={userId!} />
          
          {/* Properties Section */}
          <AgentProperties agentId={userId!} />
        </div>
      )}

      {/* Non-Agent Message */}
      {!isAgent && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">
              {isOwnProfile 
                ? "You haven't listed any properties yet. Start by creating your first property listing!" 
                : "This user hasn't listed any properties yet."}
            </p>
            {isOwnProfile && (
              <Button 
                className="mt-4"
                onClick={() => navigate('/properties/create')}
              >
                Create Property Listing
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserProfile;
