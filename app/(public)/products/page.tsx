import { ProductsPageClient } from "@/components/public/ProductsPageClient";
import { getMessages } from "@/i18n/request";

// MEMORY LEAK FIX: Use cached message loader instead of direct import
export async function generateMetadata() {
  const messages = await getMessages();
  const meta = messages.meta?.products || {};
  
  return {
    title: meta.title || "Products | KVT Jewellers",
    description: meta.description || "Browse our collection of gold coins, bars, and jewelry",
  };
}

export default async function ProductsPage() {
  return <ProductsPageClient />;
}
