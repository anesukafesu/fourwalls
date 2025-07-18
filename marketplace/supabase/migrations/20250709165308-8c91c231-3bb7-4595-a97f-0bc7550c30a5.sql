
-- Create a table for storing legal documents (Terms of Service and Privacy Policy)
CREATE TABLE public.legal_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_type TEXT NOT NULL UNIQUE CHECK (document_type IN ('terms', 'privacy')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure only admins can manage legal documents
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

-- Create policy that allows admins to manage all legal documents
CREATE POLICY "Admins can manage legal documents" 
  ON public.legal_documents 
  FOR ALL 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Create policy that allows anyone to view legal documents
CREATE POLICY "Anyone can view legal documents" 
  ON public.legal_documents 
  FOR SELECT 
  USING (true);

-- Create trigger to update the updated_at column
CREATE TRIGGER update_legal_documents_updated_at
  BEFORE UPDATE ON public.legal_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
