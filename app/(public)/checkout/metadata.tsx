import { generatePageMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return generatePageMetadata({
    title: "Checkout | KVT Jewellers",
    description: "Complete your purchase securely",
    url: "/checkout",
    noIndex: true, // Checkout is user-specific, shouldn't be indexed
    keywords: ["checkout", "purchase", "order", "KVT Jewellers"],
  });
}
