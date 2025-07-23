import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useHeaderCounts = () => {
  const { user } = useAuth();

  const { data: counts } = useQuery({
    queryKey: ['header-counts', user?.id],
    queryFn: async () => {
      if (!user) return { bookmarks: 0, properties: 0 };

      // Get bookmarks count
      const { count: bookmarksCount, error: bookmarksError } = await supabase
        .from('property_bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (bookmarksError) throw bookmarksError;

      // Get properties count
      const { count: propertiesCount, error: propertiesError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', user.id);

      if (propertiesError) throw propertiesError;

      return {
        bookmarks: bookmarksCount || 0,
        properties: propertiesCount || 0,
      };
    },
    enabled: !!user,
  });

  return counts || { bookmarks: 0, properties: 0 };
};