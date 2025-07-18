
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const PropertyTypePieChart = () => {
  const { data: pieData, isLoading } = useQuery({
    queryKey: ['property-type-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('status');

      if (error) throw error;

      const counts = data.reduce((acc: Record<string, number>, property) => {
        const status = property.status === 'for_rent' ? 'For Rent' : 
                     property.status === 'for_sale' ? 'For Sale' : 'Other';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(counts).map(([status, count]) => ({
        name: status,
        value: count,
        fill: status === 'For Rent' ? 'hsl(var(--chart-1))' : 
              status === 'For Sale' ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-3))'
      }));
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Property Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-64 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    forRent: {
      label: "For Rent",
      color: "hsl(var(--chart-1))",
    },
    forSale: {
      label: "For Sale",
      color: "hsl(var(--chart-2))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Status Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData || []}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default PropertyTypePieChart;
