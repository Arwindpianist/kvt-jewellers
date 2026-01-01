import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { fetchGoldPricesFromAPI, getPublishedGoldPrices } from "@/lib/gold-prices";
import { getAllProducts } from "@/lib/products";
import { getRecentActivityLogs } from "@/lib/activity-log";
import { DashboardContent } from "@/components/staff/DashboardContent";
import { StaffDashboardHeader } from "@/components/staff/StaffDashboardHeader";

export default async function StaffDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/staff/login");
  }

  const prices = await fetchGoldPricesFromAPI();
  const publishedPrices = getPublishedGoldPrices(prices);
  const products = getAllProducts();
  const recentActivity = getRecentActivityLogs(10);
  const allActivityLogs = getRecentActivityLogs(100);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <StaffDashboardHeader userName={session.user.name} />
      <DashboardContent
        userName={session.user.name}
        publishedPrices={publishedPrices}
        allPrices={prices}
        products={products}
        recentActivity={recentActivity}
        allActivityLogs={allActivityLogs}
      />
    </div>
  );
}

