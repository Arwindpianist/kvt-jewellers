import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { fetchGoldPricesFromAPI } from "@/lib/gold-prices";
import { PriceManager } from "@/components/staff/PriceManager";

export default async function StaffPricesPage() {
  const session = await getSession();

  if (!session) {
    redirect("/staff/login");
  }

  const prices = await fetchGoldPricesFromAPI();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold">Price Management</h1>
        <p className="text-muted-foreground">
          Manage gold prices, set overrides, and control publication status
        </p>
      </div>

      <PriceManager initialPrices={prices} />
    </div>
  );
}

