
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const PropertiesPerNeighbourhoodChart = () => {
  const { data: neighbourhoodData, isLoading } = useQuery({
    queryKey: ['properties-per-neighbourhood'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          neighbourhood,
          neighbourhoods (
            name
          )
        `)
        .not('neighbourhood', 'is', null);

      if (error) throw error;

      const counts = data.reduce((acc: Record<string, { name: string; count: number }>, property) => {
        const neighbourhoodName = property.neighbourhoods?.name || 'Unknown';
        
        if (!acc[neighbourhoodName]) {
          acc[neighbourhoodName] = { name: neighbourhoodName, count: 0 };
        }
        acc[neighbourhoodName].count++;
        return acc;
      }, {});

      return Object.values(counts).sort((a, b) => b.count - a.count);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Properties per Neighbourhood</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    count: {
      label: "Properties",
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Properties per Neighbourhood</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={neighbourhoodData || []} layout="horizontal">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PropertiesPerNeighbourhoodChart;
