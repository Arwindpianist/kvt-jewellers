import { HomePageContent } from "@/components/public/HomePageContent";
import { fetchGoldPricesFromAPI, getPublishedGoldPrices } from "@/lib/gold-prices";
import { getMessages } from "@/i18n/request";
import { generatePageMetadata } from "@/lib/metadata";

// MEMORY LEAK FIX: Use cached message loader instead of direct import
export async function generateMetadata() {
  const messages = await getMessages();
  const meta = messages.meta?.home || {};
  
  return generatePageMetadata({
    title: meta.title || "KVT Jewellers | Premium Gold and Silver Trading",
    description: meta.description || "Premium gold and silver jewelry, coins, and bullion in Malaysia",
    url: "/home",
    keywords: [
      "KVT Jewellers",
      "gold jewelry",
      "silver jewelry",
      "gold coins",
      "gold bars",
      "precious metals",
      "Malaysia",
      "916 gold",
      "999.9 gold",
      "bullion",
    ],
  });
}

export default async function HomePage() {
  const allPrices = await fetchGoldPricesFromAPI();
  const publishedPrices = getPublishedGoldPrices(allPrices);
  
  // Show 3 specific prices from live rate page: GOLD_USD, SILVER_USD, and MYR_USD
  const homePagePrices = publishedPrices.filter(
    (price) => price.type === "GOLD_USD" || price.type === "SILVER_USD" || price.type === "MYR_USD"
  );

  return <HomePageContent publishedPrices={homePagePrices} />;
}
