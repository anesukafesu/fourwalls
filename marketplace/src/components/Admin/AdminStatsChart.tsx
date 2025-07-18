
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';

interface AdminStatsChartProps {
  statType: 'users' | 'properties' | 'sessions' | 'views';
  title: string;
}

const AdminStatsChart = ({ statType, title }: AdminStatsChartProps) => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['admin-stats-chart', statType],
    queryFn: async () => {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return {
          date: format(date, 'yyyy-MM-dd'),
          label: format(date, 'MMM dd')
        };
      });

      const promises = last7Days.map(async (day) => {
        let query;
        const startOfDay = `${day.date}T00:00:00.000Z`;
        const endOfDay = `${day.date}T23:59:59.999Z`;

        switch (statType) {
          case 'users':
            query = supabase
              .from('profiles')
              .select('id', { count: 'exact', head: true })
              .gte('created_at', startOfDay)
              .lt('created_at', endOfDay);
            break;
          case 'properties':
            query = supabase
              .from('properties')
              .select('id', { count: 'exact', head: true })
              .gte('created_at', startOfDay)
              .lt('created_at', endOfDay);
            break;
          case 'sessions':
            query = supabase
              .from('chat_sessions')
              .select('id', { count: 'exact', head: true })
              .gte('created_at', startOfDay)
              .lt('created_at', endOfDay);
            break;
          case 'views':
            query = supabase
              .from('property_views')
              .select('id', { count: 'exact', head: true })
              .gte('viewed_at', startOfDay)
              .lt('viewed_at', endOfDay);
            break;
          default:
            throw new Error('Invalid stat type');
        }

        const { count } = await query;
        return {
          date: day.label,
          value: count || 0
        };
      });

      return Promise.all(promises);
    },
  });

  if (isLoading) {
    return (
      <div className="h-32 flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-600 mb-2">{title} - Last 7 Days</h4>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: '#666' }}
          />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminStatsChart;
