
-- Add read status tracking for chat messages
ALTER TABLE chat_messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;

-- Create an index to optimize queries for unread messages
CREATE INDEX idx_chat_messages_read_status ON chat_messages(chat_session_id, is_read, created_at);

-- Add a trigger to automatically mark messages as read when they are from the AI (sent_by is NULL)
CREATE OR REPLACE FUNCTION mark_ai_messages_as_read()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sent_by IS NULL THEN
    NEW.is_read = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mark_ai_messages_as_read
  BEFORE INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION mark_ai_messages_as_read();

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_as_read(session_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE chat_messages 
  SET is_read = TRUE 
  WHERE chat_session_id = session_id 
    AND sent_by != auth.uid() 
    AND is_read = FALSE;
  RETURN TRUE;
END;
$$;
