import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { fetchGoldPricesFromAPI } from "@/lib/gold-prices";
import { getAllProducts } from "@/lib/products";
import { getActivityLogs } from "@/lib/activity-log";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { AnalyticsDashboard } from "@/components/staff/AnalyticsDashboard";

export default async function AnalyticsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/staff/login");
  }

  const prices = await fetchGoldPricesFromAPI();
  const products = getAllProducts();
  const activityLogs = getActivityLogs({ limit: 100 });

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <StaffPageHeader
        icon="BarChart3"
        title="Analytics & Reports"
        description="Track price trends, product performance, and system activity"
      />
      <AnalyticsDashboard
        prices={prices}
        products={products}
        activityLogs={activityLogs}
      />
    </div>
  );
}
