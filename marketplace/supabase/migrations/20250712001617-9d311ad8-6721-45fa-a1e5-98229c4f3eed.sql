
-- Add title column to legal_documents table
ALTER TABLE public.legal_documents ADD COLUMN title TEXT;

-- Update the check constraint to allow more document types beyond just 'terms' and 'privacy'
ALTER TABLE public.legal_documents DROP CONSTRAINT IF EXISTS legal_documents_document_type_check;
