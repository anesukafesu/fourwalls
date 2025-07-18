
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChatSession {
  id: string;
  user_one: string;
  user_two: string | null;
  created_at: string;
  updated_at: string;
  user_one_profile?: {
    full_name: string | null;
    email: string | null;
  };
  user_two_profile?: {
    full_name: string | null;
    email: string | null;
  };
}

export const useChatSessionsQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['chat-sessions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // First get the chat sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('*')
        .or(`user_one.eq.${user.id},user_two.eq.${user.id}`)
        .order('updated_at', { ascending: false });
      
      if (sessionsError) throw sessionsError;

      // Get all unique user IDs from the sessions
      const userIds = new Set<string>();
      sessionsData?.forEach(session => {
        if (session.user_one) userIds.add(session.user_one);
        if (session.user_two) userIds.add(session.user_two);
      });

      // Fetch profiles for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', Array.from(userIds));

      if (profilesError) throw profilesError;

      // Create a map of profiles by user ID
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, { full_name: profile.full_name, email: profile.email });
      });

      // Combine sessions with profiles
      const sessionsWithProfiles = sessionsData?.map(session => ({
        ...session,
        user_one_profile: profilesMap.get(session.user_one),
        user_two_profile: session.user_two ? profilesMap.get(session.user_two) : null,
      }));

      return sessionsWithProfiles as ChatSession[];
    },
    enabled: !!user,
  });
};
