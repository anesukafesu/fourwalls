
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const BedroomBathroomHistogram = () => {
  const { data: histogramData, isLoading } = useQuery({
    queryKey: ['bedroom-bathroom-histogram'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('bedrooms, bathrooms')
        .not('bedrooms', 'is', null)
        .not('bathrooms', 'is', null);

      if (error) throw error;

      // Process data for histogram
      const bedroomCounts: Record<number, number> = {};
      const bathroomCounts: Record<number, number> = {};

      data.forEach((property) => {
        if (property.bedrooms) {
          bedroomCounts[property.bedrooms] = (bedroomCounts[property.bedrooms] || 0) + 1;
        }
        if (property.bathrooms) {
          const bathrooms = Math.floor(property.bathrooms);
          bathroomCounts[bathrooms] = (bathroomCounts[bathrooms] || 0) + 1;
        }
      });

      const bedroomData = Object.entries(bedroomCounts).map(([bedrooms, count]) => ({
        bedrooms: parseInt(bedrooms),
        count,
        type: 'Bedrooms'
      }));

      const bathroomData = Object.entries(bathroomCounts).map(([bathrooms, count]) => ({
        bathrooms: parseInt(bathrooms),
        count,
        type: 'Bathrooms'
      }));

      return { bedroomData, bathroomData };
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bedroom & Bathroom Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    bedrooms: {
      label: "Bedrooms",
      color: "hsl(var(--chart-1))",
    },
    bathrooms: {
      label: "Bathrooms", 
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Bedroom Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={histogramData?.bedroomData || []}>
                <XAxis dataKey="bedrooms" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-bedrooms)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bathroom Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={histogramData?.bathroomData || []}>
                <XAxis dataKey="bathrooms" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-bathrooms)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default BedroomBathroomHistogram;
