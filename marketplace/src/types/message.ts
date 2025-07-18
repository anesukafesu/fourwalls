export interface Message {
  id: string;
  message: string;
  sent_by: string;
  created_at: string;
  chat_session_id: string;
  featured_property_ids?: string[];
}
