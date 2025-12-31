import { HomePageContent } from "@/components/public/HomePageContent";
import { fetchGoldPricesFromAPI, getPublishedGoldPrices } from "@/lib/gold-prices";

export const metadata = {
  title: "KVT Jewellers | Premium Gold and Silver Trading",
  description: "Premium gold and silver jewelry, coins, and bullion in Malaysia",
};

export default async function HomePage() {
  const allPrices = await fetchGoldPricesFromAPI();
  const publishedPrices = getPublishedGoldPrices(allPrices).slice(0, 3);

  return <HomePageContent publishedPrices={publishedPrices} />;
}
