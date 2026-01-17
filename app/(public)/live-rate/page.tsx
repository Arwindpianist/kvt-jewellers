import { Suspense } from "react";
import { LiveRatePageClient } from "@/components/public/LiveRatePageClient";
import { LiveRatePageSkeleton } from "@/components/public/skeletons/LiveRatePageSkeleton";
import { getMessages } from "@/i18n/request";

// MEMORY LEAK FIX: Use cached message loader instead of direct import
export async function generateMetadata() {
  const messages = await getMessages();
  const meta = messages.meta?.liveRate || {};
  
  return {
    title: meta.title || "Live Rates | KVT Jewellers",
    description: meta.description || "Real-time gold and silver prices",
  };
}

export default function LiveRatePage() {
  return (
    <Suspense fallback={<LiveRatePageSkeleton />}>
      <LiveRatePageClient />
    </Suspense>
  );
}
