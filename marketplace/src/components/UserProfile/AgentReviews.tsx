
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, MessageSquare, Flag, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface AgentReviewsProps {
  agentId: string;
}

const AgentReviews = ({ agentId }: AgentReviewsProps) => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    message: '',
  });

  // Fetch latest 3 reviews
  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['user-latest-reviews', agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviewer_id (
            full_name,
            avatar_url
          )
        `)
        .eq('reviewed_user_id', agentId)
        .order('created_at', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!agentId,
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: async (data: { rating: number; message: string }) => {
      if (!currentUser || !agentId) throw new Error('Authentication required');
      const { error } = await supabase
        .from('reviews')
        .insert({
          reviewer_id: currentUser.id,
          reviewed_user_id: agentId,
          rating: data.rating,
          message: data.message,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-latest-reviews', agentId] });
      queryClient.invalidateQueries({ queryKey: ['user-average-rating', agentId] });
      setIsWritingReview(false);
      setReviewData({ rating: 5, message: '' });
      toast.success('Review submitted successfully');
    },
    onError: (error) => {
      toast.error('Failed to submit review: ' + error.message);
    },
  });

  const updateReviewResponseMutation = useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: string; response: string }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ agent_response: response })
        .eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reviews', agentId] });
      toast.success('Response updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update response: ' + error.message);
    },
  });

  const deleteReviewResponseMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('reviews')
        .update({ agent_response: null, responded_at: null })
        .eq('id', reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reviews', agentId] });
      toast.success('Response deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete response: ' + error.message);
    },
  });

  const handleSubmitReview = () => {
    if (!reviewData.message.trim()) {
      toast.error('Please write a review message');
      return;
    }
    submitReviewMutation.mutate(reviewData);
  };

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

  const handleStarClick = (rating: number) => {
    setReviewData({ ...reviewData, rating });
  };

  const canWriteReview = currentUser && currentUser.id !== agentId;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Reviews</CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate(`/profile/${agentId}/reviews`)}
            >
              View All Reviews
            </Button>
            {canWriteReview && !isWritingReview && (
              <Button onClick={() => setIsWritingReview(true)} size="sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Write Review
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Write Review Form */}
        {isWritingReview && (
          <Card className="border-2 border-blue-200">
            <CardContent className="py-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <button
                        key={index}
                        onClick={() => handleStarClick(index + 1)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            index < reviewData.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 hover:text-yellow-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Review</label>
                  <Textarea
                    value={reviewData.message}
                    onChange={(e) => setReviewData({ ...reviewData, message: e.target.value })}
                    placeholder="Share your experience..."
                    rows={4}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitReviewMutation.isPending}
                  >
                    Submit Review
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsWritingReview(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        {reviewsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/report-review/${review.id}`)}>
                        <Flag className="h-4 w-4 mr-2" />
                        Report Review
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="mt-3 text-gray-700">{review.message}</p>
                {review.agent_response && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">Response from agent:</p>
                    <p className="text-sm text-blue-700 mt-1">{review.agent_response}</p>
                    {review.responded_at && (
                      <p className="text-xs text-blue-600 mt-2">
                        {format(new Date(review.responded_at), 'PPp')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No reviews yet</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentReviews;
