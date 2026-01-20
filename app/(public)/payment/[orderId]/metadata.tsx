import { generatePageMetadata } from "@/lib/metadata";

interface MetadataProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: MetadataProps) {
  const { orderId } = await params;
  
  return generatePageMetadata({
    title: `Payment | Order ${orderId.slice(0, 8)} | KVT Jewellers`,
    description: "Complete your payment to confirm your order",
    url: `/payment/${orderId}`,
    noIndex: true, // Payment pages are user-specific, shouldn't be indexed
    keywords: ["payment", "order", "checkout", "KVT Jewellers"],
  });
}
