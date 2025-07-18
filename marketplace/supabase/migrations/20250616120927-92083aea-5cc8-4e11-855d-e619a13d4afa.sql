
-- Add new columns to profiles table for additional user information
ALTER TABLE public.profiles 
ADD COLUMN bio TEXT,
ADD COLUMN location TEXT,
ADD COLUMN pronouns TEXT,
ADD COLUMN phone_number TEXT;

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  agent_response TEXT,
  is_reported BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Add RLS policies for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Users can view all reviews
CREATE POLICY "Users can view all reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (true);

-- Users can create reviews for other users (not themselves)
CREATE POLICY "Users can create reviews for others" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = reviewer_id AND reviewer_id != reviewed_user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews" 
  ON public.reviews 
  FOR UPDATE 
  USING (auth.uid() = reviewer_id);

-- Reviewed users can respond to reviews about them
CREATE POLICY "Users can respond to reviews about them" 
  ON public.reviews 
  FOR UPDATE 
  USING (auth.uid() = reviewed_user_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.agent_response IS NOT NULL AND OLD.agent_response IS NULL THEN
    NEW.responded_at = now();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reviews_updated_at_trigger
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE PROCEDURE update_reviews_updated_at();

-- Create function to calculate user average rating
CREATE OR REPLACE FUNCTION get_user_average_rating(user_id UUID)
RETURNS NUMERIC AS $$
BEGIN
  RETURN (
    SELECT ROUND(AVG(rating::NUMERIC), 1)
    FROM public.reviews
    WHERE reviewed_user_id = user_id
  );
END;
$$ LANGUAGE plpgsql;
