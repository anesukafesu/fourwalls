
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const usePropertyAnalytics = () => {
  const { user } = useAuth();

  // Get agent's property count
  const { data: propertyCount } = useQuery({
    queryKey: ['agent-property-count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', user.id);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Get total views across all agent's properties
  const { data: totalViews } = useQuery({
    queryKey: ['agent-total-views', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('property_views')
        .select('property_id', { count: 'exact', head: true })
        .in('property_id', 
          (await supabase
            .from('properties')
            .select('id')
            .eq('agent_id', user.id)
          ).data?.map(p => p.id) || []
        );
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Get total bookmarks across all agent's properties
  const { data: totalBookmarks } = useQuery({
    queryKey: ['agent-total-bookmarks', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { count, error } = await supabase
        .from('property_bookmarks')
        .select('property_id', { count: 'exact', head: true })
        .in('property_id', 
          (await supabase
            .from('properties')
            .select('id')
            .eq('agent_id', user.id)
          ).data?.map(p => p.id) || []
        );
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user,
  });

  // Get top 5 most popular properties (by views)
  const { data: topProperties } = useQuery({
    queryKey: ['agent-top-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Get agent's properties
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, price, city, images')
        .eq('agent_id', user.id);
      
      if (propertiesError) throw propertiesError;
      if (!properties?.length) return [];

      // Get view counts for each property
      const propertyViewCounts = await Promise.all(
        properties.map(async (property) => {
          const { count, error } = await supabase
            .from('property_views')
            .select('*', { count: 'exact', head: true })
            .eq('property_id', property.id);
          
          if (error) console.error('Error fetching views for property:', error);
          
          return {
            ...property,
            viewCount: count || 0,
          };
        })
      );

      // Sort by view count and return top 5
      return propertyViewCounts
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 5);
    },
    enabled: !!user,
  });

  return {
    propertyCount,
    totalViews,
    totalBookmarks,
    topProperties,
  };
};

// Hook for individual property's 7-day view data
export const usePropertyViewsChart = (propertyId: string) => {
  return useQuery({
    queryKey: ['property-views-chart', propertyId],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from('property_views')
        .select('viewed_at')
        .eq('property_id', propertyId)
        .gte('viewed_at', sevenDaysAgo.toISOString())
        .order('viewed_at', { ascending: true });
      
      if (error) throw error;
      
      // Group views by day
      const viewsByDay = new Map();
      const today = new Date();
      
      // Initialize all 7 days with 0 views
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        viewsByDay.set(dateKey, 0);
      }
      
      // Count actual views per day
      data?.forEach(view => {
        const date = new Date(view.viewed_at).toISOString().split('T')[0];
        if (viewsByDay.has(date)) {
          viewsByDay.set(date, viewsByDay.get(date) + 1);
        }
      });
      
      // Convert to chart data format
      return Array.from(viewsByDay.entries()).map(([date, views]) => ({
        date,
        views,
        day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      }));
    },
    enabled: !!propertyId,
  });
};
