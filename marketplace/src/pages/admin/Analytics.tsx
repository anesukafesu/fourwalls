
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
    <div className="space-y-8 bg-neutral-50 min-h-screen p-6">
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
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <PropertyViewsTrendChart />
      </div>

      {/* Bedroom and Bathroom Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <BedroomBathroomHistogram />
      </div>

      {/* Properties per Neighbourhood and Property Status */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <PropertiesPerNeighbourhoodChart />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <PropertyTypePieChart />
        </div>
      </div>

      {/* Price Distribution Box Plots */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <PriceDistributionBoxPlots />
      </div>
    </div>
  );
}

export default Analytics;
