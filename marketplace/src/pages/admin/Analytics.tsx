
import AdminStatsCard from "@/components/Admin/AdminStatsCard";
import BedroomBathroomHistogram from "@/components/Admin/Charts/BedroomBathroomHistogram";
import PropertiesPerNeighbourhoodChart from "@/components/Admin/Charts/PropertiesPerNeighbourhoodChart";
import PropertyTypePieChart from "@/components/Admin/Charts/PropertyTypePieChart";
import PriceDistributionBoxPlots from "@/components/Admin/Charts/PriceDistributionBoxPlots";
import PropertyViewsTrendChart from "@/components/Admin/Charts/PropertyViewsTrendChart";
import { useAdminStats } from "@/hooks/useAdminStats";
import { Users, Home, MessageCircle, CreditCard } from "lucide-react";

function Analytics() {
  const { data: stats, isLoading } = useAdminStats(true);

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatsCard
          title="Total Users"
          value={stats?.users || 0}
          icon={Users}
          description="Registered users"
          statType="users"
        />
        <AdminStatsCard
          title="Total Templates"
          value={stats?.templates || 0}
          icon={Home}
          description="Available templates"
          statType="properties"
        />
        <AdminStatsCard
          title="Blog Posts"
          value={stats?.blogPosts || 0}
          icon={MessageCircle}
          description="Published posts"
          statType="sessions"
        />
        <AdminStatsCard
          title="Chat Sessions"
          value={stats?.chatSessions || 0}
          icon={CreditCard}
          description="Total chat sessions"
          statType="views"
        />
      </div>

      {/* Property Views Trend */}
      <PropertyViewsTrendChart />

      {/* Bedroom and Bathroom Distribution */}
      <BedroomBathroomHistogram />

      {/* Properties per Neighbourhood and Property Status */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PropertiesPerNeighbourhoodChart />
        <PropertyTypePieChart />
      </div>

      {/* Price Distribution Box Plots */}
      <PriceDistributionBoxPlots />
    </div>
  );
}

export default Analytics;
