import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Shopping Cart | KVT Jewellers",
    description: "Review your selected items and proceed to checkout",
    url: "/cart",
    noIndex: true, // Cart is user-specific, shouldn't be indexed
    keywords: ["shopping cart", "checkout", "KVT Jewellers"],
  });
}
