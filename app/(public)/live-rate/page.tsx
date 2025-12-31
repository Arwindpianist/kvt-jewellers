import { LiveRatesTable } from "@/components/public/LiveRatesTable";
import { ProductRatesTable } from "@/components/public/ProductRatesTable";
import { LiveRateSidebar } from "@/components/public/LiveRateSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnimatedSection, FadeIn } from "@/components/ui/animated-section";
import { fetchGoldPricesFromAPI, getPublishedGoldPrices } from "@/lib/gold-prices";
import { TrendingUp, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Live Gold & Silver Rates | KVT Jewellers",
  description: "View current gold and silver prices in Malaysia",
};

export default async function LiveRatePage() {
  const allPrices = await fetchGoldPricesFromAPI();
  const publishedPrices = getPublishedGoldPrices(allPrices);

  return (
    <div className="container mx-auto px-4 py-8">
      <FadeIn>
        <div className="mb-8 text-center">
          <Badge variant="outline" className="mb-4 border-brand-300 text-brand-700">
            <TrendingUp className="mr-2 h-3 w-3" />
            Real-Time Prices
          </Badge>
          <h1 className="mb-4 font-serif text-4xl font-bold md:text-6xl">
            Live Gold & Silver Rates
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Current market prices updated in real-time
          </p>
        </div>
      </FadeIn>

      {/* Recent Updates Banner */}
      <AnimatedSection>
        <div className="mb-6 rounded-lg border-l-4 border-brand-500 bg-brand-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-brand-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-brand-700">
                RECENT UPDATES
              </p>
              <p className="text-xs text-brand-600 mt-1">
                Select the Price by Selecting the Eye on the Right.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Two Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Live Rates Table */}
          <AnimatedSection>
            <Card className="shadow-lg">
              <CardHeader className="bg-brand-50">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-brand-600" />
                  Live Rates
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <LiveRatesTable prices={publishedPrices} />
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Product Rates Table */}
          <AnimatedSection delay={0.2}>
            <Card className="shadow-lg">
              <CardHeader className="bg-brand-50">
                <CardTitle>Product Rates</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ProductRatesTable />
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>

        {/* Sidebar */}
        <AnimatedSection delay={0.3}>
          <LiveRateSidebar />
        </AnimatedSection>
      </div>

      <AnimatedSection delay={0.4}>
        <div className="mt-8 rounded-lg border border-brand-200 bg-brand-50/50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-brand-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-brand-700 mb-1">
                Important Notice
              </p>
              <p className="text-sm text-muted-foreground">
                Prices are updated regularly and may vary. Please contact us for the most 
                current pricing and availability. All prices are subject to market conditions.
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
