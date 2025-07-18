
-- Add 'in_review' status to reports table (if not already exists)
ALTER TABLE public.reports 
DROP CONSTRAINT IF EXISTS reports_status_check;

ALTER TABLE public.reports 
ADD CONSTRAINT reports_status_check 
CHECK (status IN ('pending', 'in_review', 'resolved', 'dismissed'));

-- Update reports table to ensure update_messages column exists
ALTER TABLE public.reports 
ALTER COLUMN update_messages SET DEFAULT '{}';

-- Create function to update report status and add update messages
CREATE OR REPLACE FUNCTION public.add_report_update_message(
  report_id UUID,
  message TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can update reports';
  END IF;
  
  -- Add the message to the update_messages array
  UPDATE public.reports 
  SET 
    update_messages = COALESCE(update_messages, '{}') || ARRAY[message],
    updated_at = now()
  WHERE id = report_id;
  
  RETURN true;
END;
$$;

-- Create function to remove report update message
CREATE OR REPLACE FUNCTION public.remove_report_update_message(
  report_id UUID,
  message_index INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can update reports';
  END IF;
  
  -- Remove the message at the specified index (1-based)
  UPDATE public.reports 
  SET 
    update_messages = array_remove(update_messages, (update_messages)[message_index]),
    updated_at = now()
  WHERE id = report_id;
  
  RETURN true;
END;
$$;

-- Create function to update report status
CREATE OR REPLACE FUNCTION public.update_report_status(
  report_id UUID,
  new_status TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can update reports';
  END IF;
  
  -- Update the report status
  UPDATE public.reports 
  SET 
    status = new_status,
    updated_at = now(),
    resolved_by = CASE WHEN new_status = 'resolved' THEN auth.uid() ELSE resolved_by END,
    resolved_at = CASE WHEN new_status = 'resolved' THEN now() ELSE resolved_at END
  WHERE id = report_id;
  
  RETURN true;
END;
$$;

-- Create function to block/unblock users
CREATE OR REPLACE FUNCTION public.toggle_user_block_status(
  target_user_id UUID,
  block_status BOOLEAN
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can block/unblock users';
  END IF;
  
  -- Update the user's blocked status
  UPDATE public.profiles 
  SET is_blocked = block_status
  WHERE id = target_user_id;
  
  RETURN true;
END;
$$;

-- Create trigger to check if user is blocked before allowing access
CREATE OR REPLACE FUNCTION public.check_user_not_blocked()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is blocked (skip for admins)
  IF NOT is_admin(auth.uid()) THEN
    IF EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_blocked = TRUE
    ) THEN
      RAISE EXCEPTION 'Your account has been blocked. Please contact support.';
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply the blocking check to key tables
DROP TRIGGER IF EXISTS check_blocked_user_properties ON public.properties;
CREATE TRIGGER check_blocked_user_properties
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.check_user_not_blocked();

DROP TRIGGER IF EXISTS check_blocked_user_chat_messages ON public.chat_messages;
CREATE TRIGGER check_blocked_user_chat_messages
  BEFORE INSERT OR UPDATE ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.check_user_not_blocked();

DROP TRIGGER IF EXISTS check_blocked_user_reviews ON public.reviews;
CREATE TRIGGER check_blocked_user_reviews
  BEFORE INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.check_user_not_blocked();
