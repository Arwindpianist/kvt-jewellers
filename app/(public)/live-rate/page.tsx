import { Suspense } from "react";
import { LiveRatePageClient } from "@/components/public/LiveRatePageClient";
import { LiveRatePageSkeleton } from "@/components/public/skeletons/LiveRatePageSkeleton";
import { getMessages } from "@/i18n/request";
import { generatePageMetadata } from "@/lib/metadata";

// MEMORY LEAK FIX: Use cached message loader instead of direct import
export async function generateMetadata() {
  const messages = await getMessages();
  const meta = messages.meta?.liveRate || {};
  
  return generatePageMetadata({
    title: meta.title || "Live Rates | KVT Jewellers",
    description: meta.description || "Real-time gold and silver prices updated every 2 seconds",
    url: "/live-rate",
    keywords: [
      "live gold prices",
      "live silver prices",
      "real-time prices",
      "gold rates",
      "silver rates",
      "precious metal prices",
      "Malaysia",
    ],
  });
}

export default function LiveRatePage() {
  return (
    <Suspense fallback={<LiveRatePageSkeleton />}>
      <LiveRatePageClient />
    </Suspense>
  );
}
