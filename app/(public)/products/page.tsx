import { ProductsPageClient } from "@/components/public/ProductsPageClient";
import { getMessages } from "@/i18n/request";
import { generatePageMetadata } from "@/lib/metadata";

// MEMORY LEAK FIX: Use cached message loader instead of direct import
export async function generateMetadata() {
  const messages = await getMessages();
  const meta = messages.meta?.products || {};
  
  return generatePageMetadata({
    title: meta.title || "Products | KVT Jewellers",
    description: meta.description || "Browse our collection of gold coins, bars, and jewelry",
    url: "/products",
    keywords: [
      "gold products",
      "silver products",
      "jewelry",
      "gold coins",
      "gold bars",
      "precious metals",
      "KVT Jewellers",
    ],
  });
}

export default async function ProductsPage() {
  return <ProductsPageClient />;
}
