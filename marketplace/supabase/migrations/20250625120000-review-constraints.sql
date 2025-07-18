
-- Add unique constraint to prevent multiple reviews from same user to same user
ALTER TABLE public.reviews 
ADD CONSTRAINT unique_reviewer_reviewed UNIQUE (reviewer_id, reviewed_user_id);

-- Update RLS policy to prevent self-reviews
DROP POLICY IF EXISTS "Users can create reviews for others" ON public.reviews;

CREATE POLICY "Users can create reviews for others" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = reviewer_id 
    AND reviewer_id != reviewed_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.reviews 
      WHERE reviewer_id = auth.uid() 
      AND reviewed_user_id = NEW.reviewed_user_id
    )
  );
