
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminStats = (isAdmin: boolean = false) => {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [usersResult, templatesResult, blogPostsResult, chatSessionsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('templates').select('id', { count: 'exact' }),
        supabase.from('blog_posts').select('id', { count: 'exact' }),
        supabase.from('chat_sessions').select('id', { count: 'exact' })
      ]);

      return {
        users: usersResult.count || 0,
        templates: templatesResult.count || 0,
        blogPosts: blogPostsResult.count || 0,
        chatSessions: chatSessionsResult.count || 0
      };
    },
    enabled: isAdmin,
  });
};
