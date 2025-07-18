
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Eye, Bookmark } from 'lucide-react';

const TopPropertiesLeaderboard = () => {
  const { user } = useAuth();

  const { data: topProperties, isLoading } = useQuery({
    queryKey: ['top-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          city,
          neighbourhoods (
            name
          )
        `)
        .eq('agent_id', user.id);

      if (error) throw error;

      // Get view counts for each property
      const propertiesWithStats = await Promise.all(
        data.map(async (property) => {
          const [viewsResult, bookmarksResult] = await Promise.all([
            supabase
              .from('property_views')
              .select('*', { count: 'exact', head: true })
              .eq('property_id', property.id),
            supabase
              .from('property_bookmarks')
              .select('*', { count: 'exact', head: true })
              .eq('property_id', property.id)
          ]);

          return {
            ...property,
            views: viewsResult.count || 0,
            bookmarks: bookmarksResult.count || 0,
            totalScore: (viewsResult.count || 0) + (bookmarksResult.count || 0) * 2
          };
        })
      );

      return propertiesWithStats
        .sort((a, b) => b.totalScore - a.totalScore)
        .slice(0, 5);
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Top Performing Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!topProperties || topProperties.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Trophy className="h-5 w-5 mr-2" />
            Top Performing Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            No properties found. Create some properties to see the leaderboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2" />
          Top Performing Properties
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProperties.map((property, index) => (
            <div
              key={property.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-800' :
                  index === 1 ? 'bg-gray-100 text-gray-800' :
                  index === 2 ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{property.title}</h4>
                  <p className="text-sm text-gray-600">
                    {property.neighbourhoods?.name || 'Unknown'}, {property.city}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {property.views}
                </div>
                <div className="flex items-center">
                  <Bookmark className="h-4 w-4 mr-1" />
                  {property.bookmarks}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPropertiesLeaderboard;
