"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Sparkles, AlertCircle } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";
import { motion } from "framer-motion";

interface PriceAnalyticsData {
  goldPrice: {
    current: number;
    price24hAgo: number | null;
    change: number | null;
    changeAmount: number | null;
    recommendation: string | null;
  };
  silverPrice: {
    current: number;
    price24hAgo: number | null;
    change: number | null;
    changeAmount: number | null;
    recommendation: string | null;
  };
  exchangeRates: {
    MYR_USD: {
      current: number;
      price24hAgo: number | null;
      change: number | null;
      recommendation: string | null;
    };
    MYR_INR: {
      current: number;
      price24hAgo: number | null;
      change: number | null;
      recommendation: string | null;
    };
  };
  currency: {
    current: string;
    strength: "stronger" | "weaker" | "neutral" | null;
    change: number | null;
    recommendation: string | null;
  };
}

interface PriceAnalyticsProps {
  metalType?: "gold" | "silver";
}

export function PriceAnalytics({ metalType = "gold" }: PriceAnalyticsProps) {
  const { currency } = useCurrency();
  const [analytics, setAnalytics] = useState<PriceAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/price-analytics?currency=${currency}`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        }
      } catch (error) {
        console.error("Error fetching price analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [currency]);

  if (loading) {
    return (
      <Card className="bg-card-level-2 border-brand-200/50">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const metalData = metalType === "gold" ? analytics.goldPrice : analytics.silverPrice;
  const metalLabel = metalType === "gold" ? "Gold" : "Silver";

  const renderChange = (change: number | null, showIcon: boolean = true) => {
    if (change === null) {
      return (
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          {showIcon && <Minus className="h-3 w-3" />}
          No data
        </span>
      );
    }

    const isPositive = change > 0;
    const absChange = Math.abs(change);

    return (
      <span
        className={`text-sm font-semibold flex items-center gap-1 ${
          isPositive ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"
        }`}
      >
        {showIcon &&
          (isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          ))}
        {isPositive ? "+" : ""}
        {absChange.toFixed(2)}%
      </span>
    );
  };

  const recommendations: string[] = [];

  // Add metal price recommendation
  if (metalData.recommendation) {
    recommendations.push(metalData.recommendation);
  }

  // Add currency recommendation
  if (analytics.currency.recommendation) {
    recommendations.push(analytics.currency.recommendation);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-card-level-2 border-brand-200/50">
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <h3 className="font-semibold text-sm">24-Hour Price Analytics</h3>
            </div>
            <Badge variant="outline" className="text-xs">
              Live
            </Badge>
          </div>

          {/* Metal Price Change */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{metalLabel} Price (USD/oz)</span>
              {renderChange(metalData.change)}
            </div>
            {metalData.price24hAgo && (
              <div className="text-xs text-muted-foreground">
                24h ago: ${metalData.price24hAgo.toFixed(2)} → Now: ${metalData.current.toFixed(2)}
                {metalData.changeAmount && (
                  <span
                    className={`ml-2 ${
                      metalData.changeAmount > 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    ({metalData.changeAmount > 0 ? "+" : ""}
                    {metalData.changeAmount.toFixed(2)})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Currency Strength */}
          {analytics.currency.strength && analytics.currency.change !== null && (
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {currency} Strength (vs 24h ago)
                </span>
                <span
                  className={`text-sm font-semibold flex items-center gap-1 ${
                    analytics.currency.strength === "stronger"
                      ? "text-green-600 dark:text-green-400"
                      : analytics.currency.strength === "weaker"
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {analytics.currency.strength === "stronger" && (
                    <TrendingUp className="h-3 w-3" />
                  )}
                  {analytics.currency.strength === "weaker" && (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {analytics.currency.strength === "neutral" && <Minus className="h-3 w-3" />}
                  {analytics.currency.change > 0 ? "+" : ""}
                  {analytics.currency.change.toFixed(2)}%
                </span>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-brand-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1 flex-1">
                  {recommendations.map((rec, index) => (
                    <p key={index} className="text-xs text-foreground leading-relaxed">
                      {rec}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* No recommendations message */}
          {recommendations.length === 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Prices are stable. No significant changes in the past 24 hours.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
