import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Flag, Reply, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import AvatarUpload from '@/components/Profile/AvatarUpload';

const ManageProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [profileData, setProfileData] = useState({
    full_name: '',
    bio: '',
    location: '',
    pronouns: '',
    phone_number: '',
  });

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch user's received reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['user-received-reviews', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviewer_id (
            full_name,
            avatar_url
          )
        `)
        .eq('reviewed_user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        location: profile.location || '',
        pronouns: profile.pronouns || '',
        phone_number: profile.phone_number || '',
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      if (!user) throw new Error('No user found');
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          bio: data.bio,
          location: data.location,
          pronouns: data.pronouns,
          phone_number: data.phone_number,
        })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update profile: ' + error.message);
    },
  });

  // Reply to review mutation
  const replyToReviewMutation = useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: string; response: string }) => {
      const { error } = await supabase
        .from('reviews')
        .update({
          agent_response: response,
          responded_at: new Date().toISOString(),
        })
        .eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-received-reviews', user?.id] });
      setReplyingTo(null);
      setReplyText('');
      toast.success('Reply posted successfully');
    },
    onError: (error) => {
      toast.error('Failed to post reply: ' + error.message);
    },
  });

  // Report review mutation
  const reportReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .update({ is_reported: true })
        .eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-received-reviews', user?.id] });
      toast.success('Review reported to administrators');
    },
    onError: (error) => {
      toast.error('Failed to report review: ' + error.message);
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileData);
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleReplySubmit = (reviewId: string) => {
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }
    replyToReviewMutation.mutate({ reviewId, response: replyText });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
  };

  if (profileLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center space-x-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Profile</h1>
          <p className="text-gray-600">Update your information and manage reviews</p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="reviews">Review Management</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Upload Section */}
              <div className="flex justify-center">
                <AvatarUpload
                  currentAvatarUrl={profile?.avatar_url}
                  userId={user?.id!}
                  fullName={profile?.full_name}
                  onAvatarUpdate={handleAvatarUpdate}
                />
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={profileData.full_name}
                    onChange={handleProfileInputChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  <Input
                    id="phone_number"
                    name="phone_number"
                    value={profileData.phone_number}
                    onChange={handleProfileInputChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={profileData.location}
                    onChange={handleProfileInputChange}
                    placeholder="Enter your location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pronouns">Pronouns</Label>
                  <Input
                    id="pronouns"
                    name="pronouns"
                    value={profileData.pronouns}
                    onChange={handleProfileInputChange}
                    placeholder="e.g., he/him, she/her, they/them"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileInputChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Profile'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Review Management</CardTitle>
              <p className="text-sm text-gray-600">
                Manage reviews you've received from other users
              </p>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.reviewer?.avatar_url || ''} />
                            <AvatarFallback>
                              {review.reviewer?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.reviewer?.full_name || 'Anonymous'}</p>
                            <div className="flex items-center space-x-2">
                              <div className="flex">{renderStars(review.rating)}</div>
                              <span className="text-sm text-gray-500">
                                {format(new Date(review.created_at), 'PPP')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {review.is_reported && (
                            <Badge variant="destructive">Reported</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => reportReviewMutation.mutate(review.id)}
                            disabled={review.is_reported || reportReviewMutation.isPending}
                          >
                            <Flag className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-gray-700">{review.message}</p>
                      
                      {review.agent_response ? (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-blue-800">Your response:</p>
                          <p className="text-sm text-blue-700 mt-1">{review.agent_response}</p>
                          <p className="text-xs text-blue-600 mt-2">
                            {format(new Date(review.responded_at!), 'PPp')}
                          </p>
                        </div>
                      ) : (
                        <div>
                          {replyingTo === review.id ? (
                            <div className="space-y-3">
                              <Textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write your response..."
                                rows={3}
                              />
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => handleReplySubmit(review.id)}
                                  disabled={replyToReviewMutation.isPending}
                                  size="sm"
                                >
                                  {replyToReviewMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Reply className="h-4 w-4 mr-2" />
                                  )}
                                  Post Reply
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyText('');
                                  }}
                                  size="sm"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              onClick={() => setReplyingTo(review.id)}
                              variant="outline"
                              size="sm"
                            >
                              <Reply className="h-4 w-4 mr-2" />
                              Reply to Review
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  You haven't received any reviews yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManageProfile;
