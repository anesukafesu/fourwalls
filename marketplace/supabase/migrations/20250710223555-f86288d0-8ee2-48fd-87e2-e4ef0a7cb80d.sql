
-- First, let's add some sample neighbourhoods to work with
INSERT INTO public.neighbourhoods (name, description) VALUES 
('Kigali City Center', 'The heart of Kigali with modern buildings, shopping centers, and business districts. Known for its vibrant atmosphere and excellent connectivity.'),
('Kimisagara', 'A well-established residential area with good infrastructure, schools, and healthcare facilities. Popular among families and professionals.'),
('Gikondo', 'An emerging neighborhood with mix of residential and commercial properties. Growing rapidly with new developments.'),
('Nyamirambo', 'A bustling cultural hub known for its markets, restaurants, and traditional atmosphere. Great for those who love local culture.'),
('Remera', 'A modern suburb with upscale housing, international schools, and shopping facilities. Popular with expatriates.'),
('Gasabo', 'A large district with diverse housing options from affordable to luxury. Good transportation links throughout the city.')
ON CONFLICT (name) DO NOTHING;

-- Update the properties table to properly reference neighbourhoods
-- First, let's see what neighbourhood data exists and update it to use IDs
UPDATE public.properties 
SET neighbourhood = (
  SELECT n.id 
  FROM public.neighbourhoods n 
  WHERE n.name = properties.neighbourhood
)
WHERE neighbourhood IN (
  SELECT name FROM public.neighbourhoods
);

-- For properties with neighbourhood names that don't match, set them to NULL
UPDATE public.properties 
SET neighbourhood = NULL 
WHERE neighbourhood IS NOT NULL 
AND neighbourhood NOT IN (
  SELECT id::text FROM public.neighbourhoods
);

-- Now alter the column to be a proper UUID foreign key
ALTER TABLE public.properties 
ALTER COLUMN neighbourhood TYPE uuid USING neighbourhood::uuid;

-- Add the foreign key constraint
ALTER TABLE public.properties 
ADD CONSTRAINT fk_properties_neighbourhood 
FOREIGN KEY (neighbourhood) REFERENCES public.neighbourhoods(id);
