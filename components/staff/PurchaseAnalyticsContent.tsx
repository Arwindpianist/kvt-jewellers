"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Download, Loader2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { format } from "date-fns";
// Format price helper
const formatPrice = (price: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

interface PurchaseAnalyticsItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  metal_price_usd?: number | null;
  exchange_rate_myr?: number | null;
  exchange_rate_inr?: number | null;
  gold_price_usd_at_purchase?: number | null;
  silver_price_usd_at_purchase?: number | null;
  exchange_rate_myr_usd_at_purchase?: number | null;
  exchange_rate_inr_usd_at_purchase?: number | null;
  price_history_snapshot?: any;
  all_metal_prices_at_purchase?: any;
  all_exchange_rates_at_purchase?: any;
  pricing_metadata?: any;
  created_at: string;
  order: {
    id: string;
    status: string;
    total: number;
    created_at: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    } | null;
  };
  product: {
    id: string;
    name: string;
    category: string;
    weight: number | null;
    purity: string | null;
  };
}

export function PurchaseAnalyticsContent() {
  const [analytics, setAnalytics] = useState<PurchaseAnalyticsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    productId: "",
    startDate: "",
    endDate: "",
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.productId) params.append('productId', filters.productId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('limit', '100');

      const response = await fetch(`/api/staff/purchase-analytics?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data.analytics || []);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchAnalytics();
  };

  const handleClearFilters = () => {
    setFilters({ productId: "", startDate: "", endDate: "" });
    setTimeout(fetchAnalytics, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter purchase analytics by product, date range, etc.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="productId">Product ID</Label>
              <Input
                id="productId"
                value={filters.productId}
                onChange={(e) => handleFilterChange("productId", e.target.value)}
                placeholder="Filter by product ID"
              />
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleApplyFilters} className="flex-1">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(
                analytics.reduce((sum, item) => sum + item.price_at_purchase * item.quantity, 0),
                "USD"
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unique Products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(analytics.map(item => item.product_id)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Analytics</CardTitle>
          <CardDescription>
            Detailed price analytics for each purchase with market data at time of purchase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Date</th>
                  <th className="text-left p-2">Product</th>
                  <th className="text-left p-2">Customer</th>
                  <th className="text-right p-2">Quantity</th>
                  <th className="text-right p-2">Price</th>
                  <th className="text-right p-2">Gold Price</th>
                  <th className="text-right p-2">Silver Price</th>
                  <th className="text-right p-2">MYR/USD</th>
                  <th className="text-right p-2">INR/USD</th>
                  <th className="text-left p-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      {format(new Date(item.created_at), "MMM dd, yyyy HH:mm")}
                    </td>
                    <td className="p-2">
                      <div className="font-medium">{item.product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.product.category} • {item.product.weight}g • {item.product.purity}
                      </div>
                    </td>
                    <td className="p-2">
                      <div>{item.order.user?.name || "N/A"}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.order.user?.email || "N/A"}
                      </div>
                    </td>
                    <td className="p-2 text-right">{item.quantity}</td>
                    <td className="p-2 text-right font-medium">
                      {formatPrice(item.price_at_purchase, "USD")}
                    </td>
                    <td className="p-2 text-right">
                      {item.gold_price_usd_at_purchase
                        ? formatPrice(item.gold_price_usd_at_purchase, "USD")
                        : "N/A"}
                    </td>
                    <td className="p-2 text-right">
                      {item.silver_price_usd_at_purchase
                        ? formatPrice(item.silver_price_usd_at_purchase, "USD")
                        : "N/A"}
                    </td>
                    <td className="p-2 text-right">
                      {item.exchange_rate_myr_usd_at_purchase
                        ? item.exchange_rate_myr_usd_at_purchase.toFixed(4)
                        : "N/A"}
                    </td>
                    <td className="p-2 text-right">
                      {item.exchange_rate_inr_usd_at_purchase
                        ? item.exchange_rate_inr_usd_at_purchase.toFixed(4)
                        : "N/A"}
                    </td>
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          // Open detailed view modal (can be implemented later)
                          console.log("View details for", item.id);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {analytics.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No purchase analytics found
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
