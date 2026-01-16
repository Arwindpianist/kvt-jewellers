import { getAllProducts } from "@/lib/db/products";
import { ProductsPageClient } from "@/components/public/ProductsPageClient";

export const metadata = {
  title: "Products | KVT Jewellers",
  description: "Browse our collection of gold coins, bars, and jewelry",
};

export default async function ProductsPage() {
  const products = await getAllProducts();

  return <ProductsPageClient products={products} />;
}
