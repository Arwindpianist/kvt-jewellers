import { Suspense } from "react";
import { CurrencyProvider } from "@/lib/currency-context";
import { LiveRatePageClient } from "@/components/public/LiveRatePageClient";
import { LiveRatePageSkeleton } from "@/components/public/skeletons/LiveRatePageSkeleton";

export const metadata = {
  title: "Live Gold & Silver Rates | KVT Jewellers",
  description: "View current gold and silver prices in Malaysia",
};

export default function LiveRatePage() {
  return (
    <CurrencyProvider>
      <Suspense fallback={<LiveRatePageSkeleton />}>
        <LiveRatePageClient />
      </Suspense>
    </CurrencyProvider>
  );
}
