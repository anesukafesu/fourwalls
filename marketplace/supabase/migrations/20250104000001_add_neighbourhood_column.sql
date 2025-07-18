
-- Add neighbourhood column to properties table
ALTER TABLE properties ADD COLUMN neighbourhood text;

-- Make neighbourhood required
ALTER TABLE properties ALTER COLUMN neighbourhood SET NOT NULL;

-- Update existing records - extract neighbourhood from address
-- This is a simple extraction that takes the first part before comma
UPDATE properties 
SET neighbourhood = CASE 
  WHEN position(',' in address) > 0 THEN trim(substring(address from 1 for position(',' in address) - 1))
  ELSE address
END
WHERE neighbourhood IS NULL;

-- Remove province column if it exists (it shouldn't based on current schema but just in case)
-- ALTER TABLE properties DROP COLUMN IF EXISTS province;
