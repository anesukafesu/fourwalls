-- Create storage bucket for neighbourhood images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('neighbourhood-images', 'neighbourhood-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for neighbourhood images
CREATE POLICY "Anyone can view neighbourhood images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'neighbourhood-images');

CREATE POLICY "Admins can upload neighbourhood images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'neighbourhood-images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can update neighbourhood images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'neighbourhood-images' AND is_admin(auth.uid()));

CREATE POLICY "Admins can delete neighbourhood images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'neighbourhood-images' AND is_admin(auth.uid()));

-- Update neighbourhoods table RLS policies for admin access
CREATE POLICY "Admins can manage neighbourhoods" 
ON public.neighbourhoods 
FOR ALL 
USING (is_admin(auth.uid())) 
WITH CHECK (is_admin(auth.uid()));