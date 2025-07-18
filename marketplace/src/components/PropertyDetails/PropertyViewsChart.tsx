
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { usePropertyViewsChart } from '@/hooks/usePropertyAnalytics';
import { Eye } from 'lucide-react';

interface PropertyViewsChartProps {
  propertyId: string;
}

const PropertyViewsChart = ({ propertyId }: PropertyViewsChartProps) => {
  const { data: chartData, isLoading } = usePropertyViewsChart(propertyId);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Property Views - Last 7 Days</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalViews = chartData?.reduce((sum, day) => sum + day.views, 0) || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Property Views - Last 7 Days</span>
          </div>
          <span className="text-2xl font-bold text-primary">{totalViews}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip 
                labelFormatter={(value) => `Day: ${value}`}
                formatter={(value) => [`${value} views`, 'Views']}
              />
              <Bar 
                dataKey="views" 
                fill="#2563eb"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyViewsChart;
