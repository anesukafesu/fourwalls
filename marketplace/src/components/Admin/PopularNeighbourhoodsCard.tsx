
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

const PopularNeighbourhoodsCard = () => {
  const { data: popularNeighbourhoods, isLoading } = useQuery({
    queryKey: ['popular-neighbourhoods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          neighbourhood,
          neighbourhoods (
            id,
            name
          )
        `)
        .not('neighbourhood', 'is', null);

      if (error) throw error;

      // Count listings by neighbourhood
      const counts = data.reduce((acc: Record<string, { name: string; count: number }>, property) => {
        const neighbourhoodId = property.neighbourhood;
        const neighbourhoodName = property.neighbourhoods?.name || 'Unknown';
        
        if (!acc[neighbourhoodId]) {
          acc[neighbourhoodId] = { name: neighbourhoodName, count: 0 };
        }
        acc[neighbourhoodId].count++;
        return acc;
      }, {});

      // Convert to array and sort by count
      return Object.entries(counts)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Popular Neighbourhoods</CardTitle>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Popular Neighbourhoods</CardTitle>
        <MapPin className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {popularNeighbourhoods?.map((neighbourhood, index) => (
            <div key={neighbourhood.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                <span className="text-sm font-medium">{neighbourhood.name}</span>
              </div>
              <span className="text-sm text-gray-600">{neighbourhood.count} listings</span>
            </div>
          ))}
          {(!popularNeighbourhoods || popularNeighbourhoods.length === 0) && (
            <p className="text-sm text-gray-500">No data available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PopularNeighbourhoodsCard;
