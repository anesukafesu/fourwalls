
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import AdminStatsChart from "./AdminStatsChart";

interface AdminStatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: "up" | "down";
  description?: string;
  className?: string;
  statType?: 'users' | 'properties' | 'sessions' | 'views';
}

const AdminStatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendDirection,
  description,
  className = "",
  statType
}: AdminStatsCardProps) => {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[#111827]">
          {value.toLocaleString()}
        </div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1">
            <span
              className={
                trendDirection === "up" ? "text-green-600" : "text-red-600"
              }
            >
              {trend}
            </span>
            {description && ` ${description}`}
          </p>
        )}
        {statType && (
          <AdminStatsChart statType={statType} title={title} />
        )}
      </CardContent>
    </Card>
  );
};

export default AdminStatsCard;
