
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PriceDistributionBoxPlots = () => {
  const { data: priceData, isLoading } = useQuery({
    queryKey: ['price-distribution'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('price, status')
        .in('status', ['for_rent', 'for_sale']);

      if (error) throw error;

      const forRent = data.filter(p => p.status === 'for_rent').map(p => p.price).sort((a, b) => a - b);
      const forSale = data.filter(p => p.status === 'for_sale').map(p => p.price).sort((a, b) => a - b);

      const calculateBoxPlotStats = (prices: number[]) => {
        if (prices.length === 0) return null;
        
        const q1Index = Math.floor(prices.length * 0.25);
        const medianIndex = Math.floor(prices.length * 0.5);
        const q3Index = Math.floor(prices.length * 0.75);
        
        return {
          min: prices[0],
          q1: prices[q1Index],
          median: prices[medianIndex],
          q3: prices[q3Index],
          max: prices[prices.length - 1],
          count: prices.length,
          average: prices.reduce((sum, price) => sum + price, 0) / prices.length
        };
      };

      return {
        forRent: calculateBoxPlotStats(forRent),
        forSale: calculateBoxPlotStats(forSale)
      };
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rental Price Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse h-32 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sale Price Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse h-32 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatDisplay = ({ label, stats }: { label: string; stats: any }) => (
    <Card>
      <CardHeader>
        <CardTitle>{label} Price Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {stats ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Min: ${stats.min?.toLocaleString()}</div>
              <div>Max: ${stats.max?.toLocaleString()}</div>
              <div>Q1: ${stats.q1?.toLocaleString()}</div>
              <div>Q3: ${stats.q3?.toLocaleString()}</div>
              <div>Median: ${stats.median?.toLocaleString()}</div>
              <div>Average: ${Math.round(stats.average)?.toLocaleString()}</div>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Based on {stats.count} properties
            </div>
            <div className="relative h-12 bg-gray-100 rounded mt-4">
              <div 
                className="absolute h-full bg-blue-200 rounded"
                style={{
                  left: `${((stats.q1 - stats.min) / (stats.max - stats.min)) * 100}%`,
                  width: `${((stats.q3 - stats.q1) / (stats.max - stats.min)) * 100}%`
                }}
              />
              <div 
                className="absolute w-0.5 h-full bg-blue-600"
                style={{
                  left: `${((stats.median - stats.min) / (stats.max - stats.min)) * 100}%`
                }}
              />
              <div className="absolute w-0.5 h-full bg-gray-400" style={{ left: '0%' }} />
              <div className="absolute w-0.5 h-full bg-gray-400" style={{ left: '100%' }} />
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <StatDisplay label="Rental" stats={priceData?.forRent} />
      <StatDisplay label="Sale" stats={priceData?.forSale} />
    </div>
  );
};

export default PriceDistributionBoxPlots;
