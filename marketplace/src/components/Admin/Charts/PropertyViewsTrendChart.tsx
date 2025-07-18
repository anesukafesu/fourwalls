
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const PropertyViewsTrendChart = () => {
  const { data: viewsData, isLoading } = useQuery({
    queryKey: ['property-views-trend'],
    queryFn: async () => {
      const { data: viewsData, error: viewsError } = await supabase
        .from('property_views')
        .select('viewed_at, user_id');

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id');

      if (viewsError || profilesError) throw viewsError || profilesError;

      // Group views by date
      const viewsByDate: Record<string, number> = {};
      viewsData.forEach((view) => {
        const date = new Date(view.viewed_at).toISOString().split('T')[0];
        viewsByDate[date] = (viewsByDate[date] || 0) + 1;
      });

      // Convert to array and sort by date
      const trendData = Object.entries(viewsByDate)
        .map(([date, views]) => ({ date, views }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30); // Last 30 days

      // Calculate average views per person
      const totalViews = viewsData.length;
      const totalUsers = profilesData.length;
      const avgViewsPerPerson = totalUsers > 0 ? totalViews / totalUsers : 0;

      return {
        trendData,
        totalViews,
        totalUsers,
        avgViewsPerPerson
      };
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Property Views Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    views: {
      label: "Views",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Views Trend (Last 30 Days)</CardTitle>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-2xl font-bold">{viewsData?.totalViews?.toLocaleString()}</div>
            <div className="text-gray-600">Total Views</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{viewsData?.totalUsers?.toLocaleString()}</div>
            <div className="text-gray-600">Total Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{viewsData?.avgViewsPerPerson?.toFixed(1)}</div>
            <div className="text-gray-600">Avg Views/Person</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={viewsData?.trendData || []}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="var(--color-views)" 
                strokeWidth={2}
                dot={{ fill: 'var(--color-views)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PropertyViewsTrendChart;
