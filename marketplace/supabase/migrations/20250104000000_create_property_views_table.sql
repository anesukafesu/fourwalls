
-- Create property_views table
CREATE TABLE property_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  viewed_at timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX idx_property_views_property_id ON property_views(property_id);
CREATE INDEX idx_property_views_user_id ON property_views(user_id);
CREATE INDEX idx_property_views_viewed_at ON property_views(viewed_at);

-- Enable RLS
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view all property views" ON property_views
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own property views" ON property_views
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Allow anonymous users to track views (for non-logged-in users)
CREATE POLICY "Anonymous users can insert property views" ON property_views
  FOR INSERT WITH CHECK (user_id IS NULL);
