"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/ui/animated-section";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Package, Activity, DollarSign } from "lucide-react";
import type { GoldPrice } from "@/types/gold-prices";
import type { Product } from "@/types/products";
import type { ActivityLog } from "@/types/activity-log";

interface AnalyticsDashboardProps {
  prices: GoldPrice[];
  products: Product[];
  activityLogs: ActivityLog[];
}

export function AnalyticsDashboard({ prices, products, activityLogs }: AnalyticsDashboardProps) {
  // Price statistics
  const priceStats = useMemo(() => {
    const published = prices.filter((p) => p.isPublished);
    const avgPrice = published.length > 0
      ? published.reduce((sum, p) => sum + (p.overridePrice ?? p.fetchedPrice), 0) / published.length
      : 0;
    const totalPrices = prices.length;
    const publishedCount = published.length;

    return {
      total: totalPrices,
      published: publishedCount,
      unpublished: totalPrices - publishedCount,
      avgPrice,
    };
  }, [prices]);

  // Activity statistics
  const activityStats = useMemo(() => {
    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);
    const recentActivity = activityLogs.filter((log) => new Date(log.timestamp) >= last24h);

    const byType = activityLogs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: activityLogs.length,
      last24h: recentActivity.length,
      byType,
    };
  }, [activityLogs]);

  // Price history chart data (last 7 days of activity)
  const priceHistoryData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        updates: activityLogs.filter((log) => {
          const logDate = new Date(log.timestamp);
          return logDate.toDateString() === date.toDateString() && log.type.includes("price");
        }).length,
      };
    });
    return last7Days;
  }, [activityLogs]);

  // Activity by type chart data
  const activityByTypeData = useMemo(() => {
    return Object.entries(activityStats.byType).map(([type, count]) => ({
      type: type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      count,
    }));
  }, [activityStats.byType]);

  // Product statistics
  const productStats = useMemo(() => {
    const byCategory = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: products.length,
      byCategory,
    };
  }, [products]);

  // Product category chart data
  const productCategoryData = useMemo(() => {
    return Object.entries(productStats.byCategory).map(([category, count]) => ({
      category: category.charAt(0).toUpperCase() + category.slice(1),
      count,
    }));
  }, [productStats.byCategory]);

  return (
    <AnimatedSection>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
              <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Prices</CardTitle>
                  <TrendingUp className="h-5 w-5 text-brand-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold gold-gradient-text">{priceStats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {priceStats.published} published, {priceStats.unpublished} unpublished
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
              <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
                  <Package className="h-5 w-5 text-brand-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold gold-gradient-text">{productStats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">Products in catalog</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
              <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Activity</CardTitle>
                  <Activity className="h-5 w-5 text-brand-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold gold-gradient-text">{activityStats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activityStats.last24h} in last 24h
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
              <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Avg Price</CardTitle>
                  <DollarSign className="h-5 w-5 text-brand-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold gold-gradient-text">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "MYR",
                    minimumFractionDigits: 0,
                  }).format(priceStats.avgPrice)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Average published price</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
              <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
                <CardTitle className="font-serif text-xl font-semibold text-brand-700">
                  Price Updates (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="updates"
                      stroke="#521540"
                      strokeWidth={2}
                      name="Price Updates"
                      dot={{ fill: "#521540", r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
              <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
                <CardTitle className="font-serif text-xl font-semibold text-brand-700">
                  Activity by Type
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityByTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="type" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#521540" name="Count" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
              <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
                <CardTitle className="font-serif text-xl font-semibold text-brand-700">
                  Products by Category
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="category" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill="#d4af37" name="Products" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AnimatedSection>
  );
}
