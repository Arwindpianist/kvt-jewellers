import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { fetchGoldPricesFromAPI, getPublishedGoldPrices } from "@/lib/gold-prices";
import { getAllProductsAdmin } from "@/lib/db/products";
import { getRecentActivityLogs } from "@/lib/activity-log";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/staff/DashboardContent";
import { StaffDashboardHeader } from "@/components/staff/StaffDashboardHeader";
import { DashboardSkeleton } from "@/components/staff/skeletons/DashboardSkeleton";

export const dynamic = 'force-dynamic';

export default async function StaffDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?from=/staff/dashboard");
  }

  const prices = await fetchGoldPricesFromAPI();
  const publishedPrices = getPublishedGoldPrices(prices);
  const products = await getAllProductsAdmin();
  const recentActivity = getRecentActivityLogs(10);
  const allActivityLogs = getRecentActivityLogs(100);

  // Get order statistics and recent orders
  const supabase = createServiceRoleClient();
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      total,
      created_at,
      payment_reference,
      user:users (
        name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  const orderStats = {
    total: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'pending').length || 0,
    payment_pending: orders?.filter(o => o.status === 'payment_pending').length || 0,
    payment_verified: orders?.filter(o => o.status === 'payment_verified').length || 0,
    completed: orders?.filter(o => o.status === 'completed').length || 0,
    revenue: orders?.reduce((sum, o) => sum + Number(o.total), 0) || 0,
  };

  // Get recent orders (last 5)
  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <StaffDashboardHeader userName={session.user.name} />
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent
          userName={session.user.name}
          publishedPrices={publishedPrices}
          allPrices={prices}
          products={products}
          recentActivity={recentActivity}
          allActivityLogs={allActivityLogs}
          orderStats={orderStats}
          recentOrders={recentOrders}
        />
      </Suspense>
    </div>
  );
}

