import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface EditReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: {
    id: string;
    rating: number;
    message: string;
    reviewed_user_id: string;
  };
}

const EditReviewModal = ({ isOpen, onClose, review }: EditReviewModalProps) => {
  const [rating, setRating] = useState(review.rating);
  const [message, setMessage] = useState(review.message);
  const queryClient = useQueryClient();

  const updateReviewMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('reviews')
        .update({ rating, message })
        .eq('id', review.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-all-reviews', review.reviewed_user_id] });
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] });
      toast.success('Review updated successfully');
      onClose();
    },
    onError: (error) => {
      toast.error('Failed to update review: ' + error.message);
    },
  });

  const handleSubmit = () => {
    if (!message.trim()) {
      toast.error('Please write a review message');
      return;
    }
    updateReviewMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Review</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Rating</label>
            <div className="flex items-center space-x-1">
              {Array.from({ length: 5 }, (_, index) => (
                <button
                  key={index}
                  onClick={() => setRating(index + 1)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      index < rating
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
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
            />
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleSubmit}
              disabled={updateReviewMutation.isPending}
            >
              Update Review
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditReviewModal;