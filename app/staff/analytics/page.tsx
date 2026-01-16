import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { fetchGoldPricesFromAPI } from "@/lib/gold-prices";
import { getAllProducts } from "@/lib/products";
import { getActivityLogs } from "@/lib/activity-log";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { AnalyticsDashboard } from "@/components/staff/AnalyticsDashboard";
import { AnalyticsSkeleton } from "@/components/staff/skeletons/AnalyticsSkeleton";

export const dynamic = 'force-dynamic';

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
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsDashboard
          prices={prices}
          products={products}
          activityLogs={activityLogs}
        />
      </Suspense>
    </div>
  );
}
