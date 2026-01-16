"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Loader2, TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";
import { useCurrency } from "@/lib/currency-context";

interface PriceHistoryEntry {
  id: string;
  price_type: string;
  price_value: number;
  currency: string;
  recorded_at: string;
  created_at: string;
}

interface PriceHistoryChartProps {
  priceTypes?: string[]; // e.g., ['GOLD_USD', 'SILVER_USD']
  defaultDays?: number;
}

const getPriceTypeLabel = (type: string, currency: "USD" | "MYR" | "INR"): { label: string; color: string } => {
  const currencySymbols = { USD: "$", MYR: "RM", INR: "₹" };
  const symbol = currencySymbols[currency];
  
  if (type === "GOLD_USD" || type === "GOLD") {
    return { label: `Gold (${symbol}/oz)`, color: "#B8860B" };
  } else if (type === "SILVER_USD" || type === "SILVER") {
    return { label: `Silver (${symbol}/oz)`, color: "#C0C0C0" };
  } else if (type === "MYR_USD") {
    return { label: "MYR/USD", color: "#10B981" };
  } else if (type === "MYR_INR") {
    return { label: "MYR/INR", color: "#3B82F6" };
  }
  return { label: type, color: "#B8860B" };
};

export function PriceHistoryChart({
  priceTypes = ["GOLD_USD", "SILVER_USD"],
  defaultDays = 30,
}: PriceHistoryChartProps) {
  const { currency, formatPrice, getCurrencySymbol } = useCurrency();
  const [history, setHistory] = useState<Record<string, PriceHistoryEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(defaultDays);
  const [selectedType, setSelectedType] = useState(priceTypes[0] || "GOLD_USD");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        // Fetch real market historical data from external APIs
        const historyData: Record<string, any[]> = {};
        
        for (const type of priceTypes) {
          try {
            const response = await fetch(
              `/api/price-history/market?type=${type}&days=${selectedDays}&currency=${currency}`
            );

            if (response.ok) {
              const data = await response.json();
              // Transform market API data to our format
              historyData[type] = (data.data || []).map((point: any) => ({
                id: `${type}-${point.date}`,
                price_type: type,
                price_value: point.price || point.close,
                currency: "USD",
                recorded_at: point.date,
                created_at: point.date,
              }));
            }
          } catch (error) {
            console.error(`Error fetching ${type} history:`, error);
          }
        }

        setHistory(historyData);
      } catch (error) {
        console.error("Error fetching price history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [priceTypes, selectedDays, currency]);

  // Format data for chart
  const chartData = (() => {
    if (!history[selectedType] || history[selectedType].length === 0) {
      return [];
    }

    // Data is already daily from market API, just format it
    return history[selectedType]
      .sort((a, b) => a.recorded_at.localeCompare(b.recorded_at))
      .map((entry) => ({
        date: format(new Date(entry.recorded_at), "MMM d"),
        price: Number(entry.price_value.toFixed(2)),
        fullDate: entry.recorded_at,
      }));
  })();

  const priceInfo = getPriceTypeLabel(selectedType, currency);

  // Calculate price change
  const priceChange = (() => {
    if (chartData.length < 2) return null;
    const first = chartData[0].price;
    const last = chartData[chartData.length - 1].price;
    const change = last - first;
    const changePercent = ((change / first) * 100).toFixed(2);
    return { change, changePercent, isPositive: change >= 0 };
  })();

  return (
    <Card className="bg-card-level-2 shadow-card-elevated">
      <CardHeader className="bg-brand-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-600" />
              Price History
            </CardTitle>
            <CardDescription>
              Real-time market data from global exchanges
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground mb-2">Loading market data...</p>
            <p className="text-sm text-muted-foreground">
              Fetching historical prices from market APIs
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Type selector and time range */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {priceTypes.length > 1 ? (
                <Tabs value={selectedType} onValueChange={setSelectedType}>
                  <TabsList>
                    {priceTypes.map((type) => {
                      const info = getPriceTypeLabel(type, currency);
                      return (
                        <TabsTrigger key={type} value={type}>
                          {info.label}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </Tabs>
              ) : (
                <div className="text-sm font-medium">
                  {getPriceTypeLabel(selectedType, currency).label}
                </div>
              )}

              <ToggleGroup
                type="single"
                value={selectedDays.toString()}
                onValueChange={(value) => {
                  if (value) setSelectedDays(parseInt(value, 10));
                }}
                className="border border-border bg-muted/30 p-1 rounded-lg"
              >
                {[7, 30, 90, 180].map((days) => (
                  <ToggleGroupItem
                    key={days}
                    value={days.toString()}
                    aria-label={`Select ${days} days`}
                  >
                    {days}d
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {/* Price change indicator */}
            {priceChange && (
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="text-xs text-muted-foreground">Price Change</p>
                  <p
                    className={`text-lg font-semibold ${
                      priceChange.isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {priceChange.isPositive ? "+" : ""}
                    {priceChange.change.toFixed(2)} ({priceChange.changePercent}%)
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className="text-lg font-semibold">
                    {chartData[chartData.length - 1] ? formatPrice(chartData[chartData.length - 1].price) : "N/A"}
                  </p>
                </div>
              </div>
            )}

            {/* Chart */}
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={chartData} 
                  margin={{ top: 10, right: 10, left: 0, bottom: 50 }}
                >
                  <defs>
                    <linearGradient id={`gradient-${selectedType}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={priceInfo.color} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={priceInfo.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted opacity-30" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: "currentColor", fontSize: 10 }}
                    interval="preserveStartEnd"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "currentColor", fontSize: 10 }}
                    domain={["dataMin - 20", "dataMax + 20"]}
                    tickFormatter={(value) => `${getCurrencySymbol()}${value.toFixed(0)}`}
                    width={60}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                    formatter={(value: number | undefined) => {
                      if (value === undefined) return ["N/A", priceInfo.label];
                      return [formatPrice(value), priceInfo.label];
                    }}
                    labelFormatter={(label) => {
                      const entry = chartData.find(d => d.date === label);
                      return entry ? `Date: ${entry.fullDate}` : `Date: ${label}`;
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: "10px" }}
                    iconType="line"
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={priceInfo.color}
                    strokeWidth={2.5}
                    fill={`url(#gradient-${selectedType})`}
                    dot={false}
                    activeDot={{ r: 6, fill: priceInfo.color, strokeWidth: 2, stroke: "#fff" }}
                    name={priceInfo.label}
                    animationDuration={300}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
