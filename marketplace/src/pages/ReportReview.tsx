import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Star } from 'lucide-react';
import { toast } from 'sonner';

const ReportReview = () => {
  const { reviewId } = useParams<{ reviewId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');

  const { data: review } = useQuery({
    queryKey: ['review', reviewId],
    queryFn: async () => {
      if (!reviewId) throw new Error('Review ID required');
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:profiles!reviews_reviewer_id_fkey(id, full_name, email, avatar_url),
          reviewed_user:profiles!reviews_reviewed_user_id_fkey(id, full_name, email, avatar_url)
        `)
        .eq('id', reviewId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!reviewId,
  });

  const submitReportMutation = useMutation({
    mutationFn: async () => {
      if (!user || !reviewId) throw new Error('Authentication required');
      const { error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          report_type: 'review',
          reported_entity_id: reviewId,
          reason,
          details,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Report submitted successfully');
      navigate(-1);
    },
    onError: (error) => {
      toast.error('Failed to submit report: ' + error.message);
    },
  });

  const handleSubmit = () => {
    if (!reason) {
      toast.error('Please select a reason for reporting');
      return;
    }
    submitReportMutation.mutate();
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Please sign in to report a review.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Report Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {review && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.reviewer?.avatar_url || ''} />
                    <AvatarFallback>
                      {review.reviewer?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{review.reviewer?.full_name || 'Anonymous'}</h4>
                    <p className="text-sm text-gray-600">
                      Review for {review.reviewed_user?.full_name || 'Unknown User'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {renderStars(review.rating)}
                </div>
              </div>
              
              <div className="border-t pt-3">
                <p className="text-gray-700">{review.message}</p>
                {review.agent_response && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm font-medium text-blue-800 mb-1">Agent Response:</p>
                    <p className="text-sm text-blue-700">{review.agent_response}</p>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                Posted {new Date(review.created_at).toLocaleDateString()}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Reason for reporting</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inappropriate_content">Inappropriate content</SelectItem>
                <SelectItem value="fake_review">Fake or fraudulent review</SelectItem>
                <SelectItem value="harassment">Harassment or abuse</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="false_information">False or misleading information</SelectItem>
                <SelectItem value="hate_speech">Hate speech</SelectItem>
                <SelectItem value="personal_information">Contains personal information</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Additional details</label>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide more details about why you're reporting this review..."
              rows={4}
            />
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleSubmit}
              disabled={submitReportMutation.isPending || !reason}
            >
              Submit Report
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportReview;