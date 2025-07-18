
-- Update chat_messages table to support multiple featured properties
ALTER TABLE public.chat_messages 
DROP COLUMN IF EXISTS featured_property_id,
ADD COLUMN IF NOT EXISTS featured_property_ids UUID[] DEFAULT NULL;

-- Create RLS policies for public access to profiles and reviews
-- First, enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profiles" ON public.profiles;

-- Allow anyone to view profiles (make them public)
CREATE POLICY "Anyone can view profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

-- Users can still only update their own profiles
CREATE POLICY "Users can update their own profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Drop existing review policies if they exist and recreate them
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- Allow anyone to view reviews (make them public)
CREATE POLICY "Anyone can view reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (true);
