"use client";

import { useState, useEffect } from "react";
import { LivePriceTicker } from "@/components/public/LivePriceTicker";
import { ProductRatesTable } from "@/components/public/ProductRatesTable";
import { ConsolidatedMobileTable } from "@/components/public/ConsolidatedMobileTable";
import { LiveRateSidebar } from "@/components/public/LiveRateSidebar";
import { CurrencySelector } from "@/components/public/CurrencySelector";
import TradingViewWidget from "@/components/public/TradingViewWidget";
import { LiveRatePageSkeleton } from "@/components/public/skeletons/LiveRatePageSkeleton";
import { useCurrency } from "@/lib/currency-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection, FadeIn } from "@/components/ui/animated-section";
import { TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import type { GoldPrice } from "@/types/gold-prices";

interface LiveRatePageClientProps {
  publishedPrices?: GoldPrice[];
}

export function LiveRatePageClient({ publishedPrices: initialPrices }: LiveRatePageClientProps) {
  const t = useTranslations("liveRate");
  const { currency, setCurrency } = useCurrency();
  const [publishedPrices, setPublishedPrices] = useState<GoldPrice[]>(initialPrices || []);
  const [loading, setLoading] = useState(!initialPrices || initialPrices.length === 0);

  // Fetch prices on mount if not provided
  useEffect(() => {
    if (initialPrices && initialPrices.length > 0) {
      setLoading(false);
      return;
    }

    const fetchPrices = async () => {
      try {
        const response = await fetch("/api/gold-prices/public");
        const data = await response.json();
        
        if (response.ok && data.prices) {
          setPublishedPrices(data.prices);
        }
      } catch (error) {
        console.error("Error fetching gold prices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [initialPrices]);

  if (loading) {
    return <LiveRatePageSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <FadeIn>
        <div className="mb-8">
          <div className="text-center mb-4">
            <Badge variant="outline" className="mb-4 border-brand-300 text-brand-700">
              <TrendingUp className="mr-2 h-3 w-3" />
              {t("realTimePrices")}
            </Badge>
            <h1 className="mb-4 font-serif text-4xl font-bold md:text-6xl">
              {t("liveGoldSilverRates")}
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground mb-6">
              {t("currentMarketPrices")}
            </p>
          </div>
          
          {/* Currency Selector */}
          <div className="flex justify-center">
            <CurrencySelector
              selectedCurrency={currency}
              onCurrencyChange={setCurrency}
            />
          </div>
        </div>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        {/* Main Content - Two Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Consolidated Mobile Table - Hidden on Desktop */}
          <AnimatedSection className="md:hidden">
            <Card className="bg-card-level-2 shadow-card-elevated">
              <CardHeader className="bg-brand-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-brand-600" />
                    {t("liveRates")}
                  </CardTitle>
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5">
                      <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-600"></div>
                      <span className="text-[10px] font-medium text-green-700">{t("live")}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 px-3 pb-3">
                <ConsolidatedMobileTable prices={publishedPrices} />
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Desktop Live Rates Table */}
          <AnimatedSection className="hidden md:block">
            <Card className="bg-card-level-2 shadow-card-elevated">
              <CardHeader className="bg-brand-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-brand-600" />
                    {t("liveRates")}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-600"></div>
                      <span className="text-xs font-medium text-green-700">{t("realTimePrices")}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{t("updatesEvery2s")}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <LivePriceTicker prices={publishedPrices} />
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* TradingView Widget */}
          <AnimatedSection delay={0.2}>
            <Card className="bg-card-level-2 shadow-card-elevated">
              <CardHeader className="bg-brand-50">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-brand-600" />
                  {t("marketOverview")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-6">
                <div className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] xl:h-[800px] flex flex-col">
                  <TradingViewWidget />
                </div>
              </CardContent>
            </Card>
          </AnimatedSection>

          {/* Product Rates Table - Both Mobile and Desktop */}
          <AnimatedSection delay={0.3}>
            <Card className="bg-card-level-2 shadow-card-elevated">
              <CardHeader className="bg-brand-50">
                <CardTitle>{t("productRates")}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ProductRatesTable />
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>

        {/* Sidebar - pt-6 matches main's space-y-6 offset so Online Trading and Live Rates tops align */}
        <AnimatedSection delay={0.3} className="order-1 lg:order-2 lg:pt-6">
          <LiveRateSidebar />
        </AnimatedSection>
      </div>

      <AnimatedSection delay={0.4}>
        <div className="mt-8 rounded-lg border border-brand-200 bg-brand-50/50 p-6">
          <div>
            <p className="text-sm font-semibold text-brand-700 mb-1">
              {t("importantNotice")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("importantNoticeDesc")}
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Disclaimer */}
      <AnimatedSection delay={0.5}>
        <div className="mt-8 rounded-lg border border-brand-200/50 dark:border-brand-700/20 bg-card-level-1 shadow-card p-6">
          <p className="text-xs leading-relaxed text-muted-foreground text-center">
            {t("disclaimer")}
          </p>
        </div>
      </AnimatedSection>
    </div>
  );
}
