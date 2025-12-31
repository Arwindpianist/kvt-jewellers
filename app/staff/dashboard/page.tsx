import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { fetchGoldPricesFromAPI, getPublishedGoldPrices } from "@/lib/gold-prices";
import { getAllProducts } from "@/lib/products";
import { DashboardContent } from "@/components/staff/DashboardContent";

export default async function StaffDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/staff/login");
  }

  const prices = await fetchGoldPricesFromAPI();
  const publishedPrices = getPublishedGoldPrices(prices);
  const products = getAllProducts();

  return (
    <DashboardContent
      userName={session.user.name}
      publishedPrices={publishedPrices}
      allPrices={prices}
      products={products}
    />
  );
}

