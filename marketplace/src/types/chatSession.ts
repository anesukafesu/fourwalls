export interface ChatSession {
  id: string;
  user_one: string;
  user_two: string | null;
  created_at: string;
  updated_at: string;
  user_one_profile?: {
    full_name: string | null;
    email: string | null;
    avatar_url?: string | null;
  };
  user_two_profile?: {
    full_name: string | null;
    email: string | null;
    avatar_url?: string | null;
  };
}
