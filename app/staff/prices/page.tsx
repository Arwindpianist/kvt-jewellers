import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { fetchGoldPricesFromAPI } from "@/lib/gold-prices";
import { PriceManager } from "@/components/staff/PriceManager";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { PricesSkeleton } from "@/components/staff/skeletons/PricesSkeleton";

export const dynamic = 'force-dynamic';

export default async function StaffPricesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?from=/staff/dashboard");
  }

  const prices = await fetchGoldPricesFromAPI();

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <StaffPageHeader
        icon="TrendingUp"
        title="Price Management"
        description="Manage gold prices, set buy/sell percentages, exchange rates, and control publication status"
      />
      <Suspense fallback={<PricesSkeleton />}>
        <PriceManager initialPrices={prices} />
      </Suspense>
    </div>
  );
}

