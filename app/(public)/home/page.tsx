import { HomePageContent } from "@/components/public/HomePageContent";
import { fetchGoldPricesFromAPI, getPublishedGoldPrices } from "@/lib/gold-prices";

export const metadata = {
  title: "KVT Jewellers | Premium Gold and Silver Trading",
  description: "Premium gold and silver jewelry, coins, and bullion in Malaysia",
};

export default async function HomePage() {
  const allPrices = await fetchGoldPricesFromAPI();
  const publishedPrices = getPublishedGoldPrices(allPrices);
  
  // Show 3 specific prices from live rate page: GOLD_USD, SILVER_USD, and MYR_USD
  const homePagePrices = publishedPrices.filter(
    (price) => price.type === "GOLD_USD" || price.type === "SILVER_USD" || price.type === "MYR_USD"
  );

  return <HomePageContent publishedPrices={homePagePrices} />;
}
