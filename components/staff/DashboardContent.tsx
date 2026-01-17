"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedButton } from "@/components/public/AnimatedButton";
import { StaggerAnimation, StaggerItem } from "@/components/ui/stagger-animation";
import { HoverCard } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { useMemo, useState, useEffect } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Package, Zap, ArrowRight, Clock, FileText, DollarSign, AlertCircle, CheckCircle2, BarChart3, Activity, ShoppingBag, Users, Heart, UserPlus, TrendingDown, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { format } from "date-fns";
import type { GoldPrice } from "@/types/gold-prices";
import type { Product } from "@/types/products";
import type { ActivityLog } from "@/types/activity-log";

interface OrderStats {
  total: number;
  pending: number;
  payment_pending: number;
  payment_verified: number;
  completed: number;
  revenue: number;
}

type RecentOrder = {
  id: string;
  payment_reference: string;
  status: string;
  total: number;
  created_at: string;
  user: {
    name: string;
    email: string;
  } | null;
};

interface BusinessStats {
  users: {
    total: number;
    customers: number;
    new24h: number;
    new7d: number;
    new30d: number;
  };
  orders: {
    total: number;
    completed: number;
    revenue: number;
    completedRevenue: number;
    avgOrderValue: number;
    count24h: number;
    count7d: number;
    count30d: number;
    revenue24h: number;
    revenue7d: number;
    revenue30d: number;
    revenueTrendData?: Array<{ date: string; revenue: number }>;
    revenueGrowth?: number;
    ordersGrowth?: number;
  };
  wishlist: {
    totalItems: number;
    uniqueUsers: number;
    items24h: number;
    items7d: number;
    avgItemsPerUser: number;
  };
  preRegistrations: {
    total: number;
    pending: number;
    converted: number;
    count24h: number;
    count7d: number;
    conversionRate: number;
  };
  products: {
    total: number;
    new24h: number;
    new7d: number;
  };
  sales: {
    totalItemsSold: number;
    itemsSold24h: number;
    itemsSold7d: number;
    topProducts?: Array<{ productId: string; sales: number }>;
  };
  engagement: {
    customersWithOrders: number;
    customersWithWishlist: number;
    customerEngagementRate: number;
    avgOrdersPerCustomer: number;
    orderConversionRate: number;
    wishlistToOrderRate: number;
  };
}

interface DashboardContentProps {
  userName: string;
  publishedPrices: GoldPrice[];
  allPrices: GoldPrice[];
  products: Product[];
  recentActivity: ActivityLog[];
  allActivityLogs: ActivityLog[];
  orderStats: OrderStats;
  recentOrders: RecentOrder[];
  businessStats?: BusinessStats | null;
}

export function DashboardContent({
  userName,
  publishedPrices,
  allPrices,
  products,
  recentActivity,
  allActivityLogs,
  orderStats,
  recentOrders,
  businessStats,
}: DashboardContentProps) {
  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  // Calculate insights with trend analysis
  const insights = useMemo(() => {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last14d = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const activity24h = allActivityLogs.filter((log) => new Date(log.timestamp) >= last24h);
    const activityPrevious24h = allActivityLogs.filter((log) => {
      const logDate = new Date(log.timestamp);
      return logDate >= last48h && logDate < last24h;
    });
    
    const priceUpdates24h = activity24h.filter((log) => log.type.includes("price")).length;
    const productUpdates24h = activity24h.filter((log) => log.type.includes("product")).length;
    
    // Calculate average price
    const avgPrice = publishedPrices.length > 0
      ? publishedPrices.reduce((sum, p) => sum + (p.overridePrice ?? p.fetchedPrice), 0) / publishedPrices.length
      : 0;
    
    // Products by category
    const productsByCategory = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Price types breakdown
    const goldPrices = allPrices.filter((p) => p.type.includes("GOLD"));
    const silverPrices = allPrices.filter((p) => p.type.includes("SILVER"));
    const exchangeRates = allPrices.filter((p) => p.type.includes("MYR") || p.type.includes("USD") || p.type.includes("INR"));
    
    // Unpublished prices count
    const unpublishedCount = allPrices.filter((p) => !p.isPublished).length;
    
    // Calculate trends
    const activityTrend = activityPrevious24h.length > 0 
      ? ((activity24h.length - activityPrevious24h.length) / activityPrevious24h.length) * 100 
      : 0;
    
    // Revenue trends (if businessStats available)
    const revenueTrend = businessStats ? (() => {
      const revenue7d = businessStats.orders.revenue7d;
      const revenue14d = businessStats.orders.revenue30d - revenue7d; // Approximate previous 7d
      return revenue14d > 0 ? ((revenue7d - revenue14d) / revenue14d) * 100 : 0;
    })() : 0;
    
    // Order trends
    const orderTrend = businessStats ? (() => {
      const orders7d = businessStats.orders.count7d;
      const orders14d = businessStats.orders.count30d - orders7d;
      return orders14d > 0 ? ((orders7d - orders14d) / orders14d) * 100 : 0;
    })() : 0;
    
    return {
      activity24h: activity24h.length,
      priceUpdates24h,
      productUpdates24h,
      avgPrice,
      productsByCategory,
      goldPrices: goldPrices.length,
      silverPrices: silverPrices.length,
      exchangeRates: exchangeRates.length,
      unpublishedCount,
      activityTrend: Math.round(activityTrend * 10) / 10,
      revenueTrend: Math.round(revenueTrend * 10) / 10,
      orderTrend: Math.round(orderTrend * 10) / 10,
    };
  }, [allPrices, publishedPrices, products, allActivityLogs, businessStats]);
  // Calculate key insights
  const keyInsights = useMemo(() => {
    if (!businessStats) return null;
    
    const insights = [];
    
    // Revenue insight
    if (businessStats.orders.revenueGrowth !== undefined && businessStats.orders.revenueGrowth > 0) {
      insights.push({
        type: "success",
        icon: TrendingUp,
        title: "Revenue Growth",
        message: `Revenue increased by ${Math.abs(businessStats.orders.revenueGrowth).toFixed(1)}% this week`,
        color: "green",
      });
    }
    
    // Customer growth
    if (businessStats.users.new7d > 0) {
      insights.push({
        type: "info",
        icon: Users,
        title: "New Customers",
        message: `${businessStats.users.new7d} new customers joined this week`,
        color: "blue",
      });
    }
    
    // Conversion insight
    if (businessStats.engagement.orderConversionRate > 50) {
      insights.push({
        type: "success",
        icon: BarChart3,
        title: "Strong Conversion",
        message: `${businessStats.engagement.orderConversionRate}% of customers are placing orders`,
        color: "purple",
      });
    }
    
    // Wishlist insight
    if (businessStats.wishlist.totalItems > 0 && businessStats.engagement.wishlistToOrderRate > 0) {
      insights.push({
        type: "info",
        icon: Heart,
        title: "Wishlist Engagement",
        message: `${businessStats.wishlist.totalItems} items in wishlists with ${businessStats.engagement.wishlistToOrderRate}% conversion`,
        color: "pink",
      });
    }
    
    return insights.slice(0, 3); // Show top 3 insights
  }, [businessStats]);

  return (
    <div className="space-y-6 pb-8">
      <StaggerAnimation className="space-y-6">
        {/* Welcome & Key Insights Banner */}
        {keyInsights && keyInsights.length > 0 && (
          <StaggerItem className="block">
            <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-gradient-to-r from-brand-50/80 via-amber-50/60 to-brand-50/80 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-brand-700 mb-2">Key Insights</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {keyInsights.map((insight, index) => {
                        const Icon = insight.icon;
                        return (
                          <div
                            key={index}
                            className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/60 border border-white/50"
                          >
                            <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${
                              insight.color === "green" ? "from-green-500 to-emerald-600" :
                              insight.color === "blue" ? "from-blue-500 to-cyan-600" :
                              insight.color === "purple" ? "from-purple-500 to-pink-600" :
                              "from-pink-500 to-rose-600"
                            } shadow-sm flex-shrink-0`}>
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-foreground mb-0.5">{insight.title}</p>
                              <p className="text-xs text-muted-foreground leading-tight">{insight.message}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        )}

        {/* Quick Actions - Compact CTA Buttons */}
        <StaggerItem className="block">
          <div className="flex flex-wrap items-center gap-3">
            {[
              {
                href: "/staff/prices",
                icon: TrendingUp,
                label: "Manage Prices",
                gradient: "from-amber-500 to-amber-600",
              },
              {
                href: "/staff/products",
                icon: Package,
                label: "Manage Products",
                gradient: "from-blue-500 to-blue-600",
              },
              {
                href: "/staff/products/new",
                icon: Package,
                label: "Add Product",
                gradient: "from-blue-500 to-blue-600",
              },
              {
                href: "/staff/orders",
                icon: ShoppingBag,
                label: "View Orders",
                gradient: "from-green-500 to-green-600",
              },
              {
                href: "/staff/analytics",
                icon: BarChart3,
                label: "Analytics",
                gradient: "from-purple-500 to-purple-600",
              },
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group inline-flex items-center gap-2 rounded-lg border border-brand-200/50 bg-white px-4 py-2.5 text-sm font-medium text-brand-700 shadow-sm transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:shadow-md"
                >
                  <div className={`flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br ${action.gradient} shadow-sm transition-transform duration-200 group-hover:scale-105`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span>{action.label}</span>
                </Link>
              );
            })}
          </div>
        </StaggerItem>

        {/* Summary Banner - Key Metrics at a Glance with Trends */}
        <StaggerItem>
          <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-gradient-to-r from-brand-50 via-amber-50/50 to-brand-50 shadow-card-elevated overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
            <CardContent className="p-5 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                  { 
                    icon: TrendingUp, 
                    label: "Published Prices", 
                    value: publishedPrices.length, 
                    colorClass: "gold-gradient-text", 
                    gradient: "from-brand-500 to-brand-600",
                    trend: null,
                  },
                  { 
                    icon: Package, 
                    label: "Total Products", 
                    value: products.length, 
                    colorClass: "text-blue-600", 
                    gradient: "from-blue-500 to-blue-600",
                    trend: businessStats ? {
                      value: businessStats.products.new7d,
                      label: "New this week",
                      positive: true,
                    } : null,
                  },
                  { 
                    icon: ShoppingBag, 
                    label: "Total Orders", 
                    value: orderStats.total, 
                    colorClass: "text-green-600", 
                    gradient: "from-green-500 to-green-600",
                    trend: businessStats ? {
                      value: insights.orderTrend,
                      label: "vs last week",
                      positive: insights.orderTrend >= 0,
                    } : null,
                  },
                  { 
                    icon: DollarSign, 
                    label: "Total Revenue", 
                    value: orderStats.revenue, 
                    colorClass: "text-purple-600", 
                    gradient: "from-purple-500 to-purple-600", 
                    isCurrency: true,
                    trend: businessStats ? {
                      value: insights.revenueTrend,
                      label: "vs last week",
                      positive: insights.revenueTrend >= 0,
                    } : null,
                  },
                ].map((item, index) => {
                  const Icon = item.icon;
                  const TrendIcon = item.trend?.positive ? ArrowUpRight : ArrowDownRight;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex items-start gap-3 p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-white/60 hover:bg-white/90 hover:shadow-md hover:scale-[1.02] transition-all duration-300 group"
                    >
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-md flex-shrink-0`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground mb-1.5">{item.label}</p>
                        <p className={`text-2xl font-bold ${item.colorClass} mb-1`}>
                          {item.isCurrency
                            ? new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "MYR",
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(item.value)
                            : item.value}
                        </p>
                        {item.trend && (
                          <div className={`flex items-center gap-1 text-xs font-medium ${
                            item.trend.positive ? "text-green-600" : "text-red-600"
                          }`}>
                            <TrendIcon className="h-3 w-3" />
                            <span>{Math.abs(item.trend.value).toFixed(1)}%</span>
                            <span className="text-muted-foreground/70 ml-1">{item.trend.label}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </StaggerItem>

        {/* Quick Status Indicators */}
        <StaggerItem className="block">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-fr">
          {[
            { icon: Activity, label: "Activity (24h)", value: insights.activity24h, subtitle: `${insights.priceUpdates24h} price, ${insights.productUpdates24h} product`, colorClass: "gold-gradient-text", iconColor: "text-brand-600", trend: insights.activityTrend },
            { icon: AlertCircle, label: "Unpublished Prices", value: insights.unpublishedCount, subtitle: "Requires attention", colorClass: "text-orange-600", iconColor: "text-orange-600" },
            { icon: AlertCircle, label: "Pending Orders", value: orderStats.pending + orderStats.payment_pending, subtitle: "Awaiting action", colorClass: "text-yellow-600", iconColor: "text-yellow-600" },
          ].map((metric, index) => {
            const Icon = metric.icon;
            return (
              <StaggerItem key={index} className="w-full">
                <Card className="h-full w-full border border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group">
                  <CardHeader className="pb-2 pt-3 px-3 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-medium text-muted-foreground leading-tight">{metric.label}</CardTitle>
                      <Icon className={`h-4 w-4 ${metric.iconColor} flex-shrink-0 transition-transform group-hover:scale-110`} />
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between pt-2 px-3 pb-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline gap-2">
                        <div className={`text-2xl font-bold ${metric.colorClass}`}>
                          {metric.value}
                        </div>
                        {metric.trend !== undefined && (
                          <div className={`flex items-center gap-0.5 text-xs font-medium ${
                            metric.trend >= 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            {metric.trend >= 0 ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}
                            <span>{Math.abs(metric.trend).toFixed(1)}%</span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground leading-tight">{metric.subtitle}</p>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
          </div>
        </StaggerItem>

        {/* Revenue Trend Chart */}
        {businessStats?.orders.revenueTrendData && businessStats.orders.revenueTrendData.length > 0 && (
          <StaggerItem className="block">
            <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
              <CardHeader className="pb-3 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-brand-700">Revenue Trend (7 Days)</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">Daily revenue performance</p>
                  </div>
                  {businessStats.orders.revenueGrowth !== undefined && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                      businessStats.orders.revenueGrowth >= 0 
                        ? "bg-green-50 text-green-700 dark:bg-green-900/20" 
                        : "bg-red-50 text-red-700 dark:bg-red-900/20"
                    }`}>
                      {businessStats.orders.revenueGrowth >= 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      <span className="text-sm font-bold">{Math.abs(businessStats.orders.revenueGrowth).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-2 px-4 pb-4">
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={businessStats.orders.revenueTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: "currentColor" }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: "currentColor" }}
                      stroke="#6b7280"
                      tickFormatter={(value) => `MYR ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        padding: "8px 12px",
                      }}
                      formatter={(value: number | undefined) => [
                        new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "MYR",
                          minimumFractionDigits: 0,
                        }).format(value || 0),
                        "Revenue"
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#d4af37" 
                      strokeWidth={2}
                      fill="url(#revenueGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </StaggerItem>
        )}

        {/* Business Statistics - Comprehensive Metrics */}
        {businessStats && (
          <StaggerItem className="block">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Customer Engagement */}
              <Card className="border border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 pt-3 px-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-brand-700">Customer Engagement</CardTitle>
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent className="pt-2 px-3 pb-3 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Engagement Rate</span>
                    <span className="text-base font-bold text-blue-600">{businessStats.engagement.customerEngagementRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Avg Orders/Customer</span>
                    <span className="text-base font-bold text-brand-600">{businessStats.engagement.avgOrdersPerCustomer}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">With Wishlist</span>
                    <span className="text-base font-bold text-pink-600">{businessStats.engagement.customersWithWishlist}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Sales Performance with Growth */}
              <Card className="border border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 pt-3 px-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-brand-700">Sales (7d)</CardTitle>
                    <div className="flex items-center gap-2">
                      {businessStats.orders.ordersGrowth !== undefined && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${
                          businessStats.orders.ordersGrowth >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {businessStats.orders.ordersGrowth >= 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          <span>{Math.abs(businessStats.orders.ordersGrowth).toFixed(1)}%</span>
                        </div>
                      )}
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 px-3 pb-3 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Revenue</span>
                    <span className="text-base font-bold text-green-600">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "MYR",
                        minimumFractionDigits: 0,
                      }).format(businessStats.orders.revenue7d)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Orders</span>
                    <span className="text-base font-bold text-brand-600">{businessStats.orders.count7d}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Items Sold</span>
                    <span className="text-base font-bold text-purple-600">{businessStats.sales.itemsSold7d}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Conversion Metrics */}
              <Card className="border border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 pt-3 px-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-brand-700">Conversion Rates</CardTitle>
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent className="pt-2 px-3 pb-3 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Customer → Order</span>
                    <span className="text-base font-bold text-green-600">{businessStats.engagement.orderConversionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Wishlist → Order</span>
                    <span className="text-base font-bold text-pink-600">{businessStats.engagement.wishlistToOrderRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Pre-Reg → Converted</span>
                    <span className="text-base font-bold text-purple-600">{businessStats.preRegistrations.conversionRate}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* User Growth */}
              <Card className="border border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 pt-3 px-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-brand-700">User Growth</CardTitle>
                    <UserPlus className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent className="pt-2 px-3 pb-3 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">New (24h)</span>
                    <span className="text-base font-bold text-blue-600">{businessStats.users.new24h}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">New (7d)</span>
                    <span className="text-base font-bold text-brand-600">{businessStats.users.new7d}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total Customers</span>
                    <span className="text-base font-bold text-purple-600">{businessStats.users.customers}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </StaggerItem>
        )}

        {/* Key Insights & Highlights */}
        {businessStats && (
          <StaggerItem className="block">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Revenue Highlight */}
              <Card className="border-2 border-green-200/50 dark:border-green-700/50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">7-Day Revenue</p>
                        <p className="text-xl font-bold text-green-700">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "MYR",
                            minimumFractionDigits: 0,
                          }).format(businessStats.orders.revenue7d)}
                        </p>
                      </div>
                    </div>
                    {businessStats.orders.revenueGrowth !== undefined && (
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
                        businessStats.orders.revenueGrowth >= 0 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30" 
                          : "bg-red-100 text-red-700 dark:bg-red-900/30"
                      }`}>
                        {businessStats.orders.revenueGrowth >= 0 ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                        <span className="text-xs font-bold">{Math.abs(businessStats.orders.revenueGrowth).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Avg Order Value</span>
                    <span className="font-semibold text-foreground">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "MYR",
                        minimumFractionDigits: 0,
                      }).format(businessStats.orders.avgOrderValue)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Growth Highlight */}
              <Card className="border-2 border-blue-200/50 dark:border-blue-700/50 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">New Customers</p>
                        <p className="text-xl font-bold text-blue-700">{businessStats.users.new7d}</p>
                      </div>
                    </div>
                    <Sparkles className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Total Customers</span>
                    <span className="font-semibold text-foreground">{businessStats.users.customers}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Conversion Highlight */}
              <Card className="border-2 border-purple-200/50 dark:border-purple-700/50 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Conversion Rate</p>
                        <p className="text-xl font-bold text-purple-700">{businessStats.engagement.orderConversionRate}%</p>
                      </div>
                    </div>
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Wishlist → Order</span>
                    <span className="font-semibold text-foreground">{businessStats.engagement.wishlistToOrderRate}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </StaggerItem>
        )}

        {/* Recent Orders & Activity - Actionable Items */}
        <StaggerItem className="block">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
        <StaggerItem className="w-full">
          <Card className="h-full w-full border border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-sm flex flex-col">
            <CardHeader className="flex-shrink-0 pt-3 px-3 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-brand-700">
                  Recent Orders
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-green-600">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-3 px-3 pb-3 flex-1 flex flex-col">
              <div className="flex-1 min-h-0">
                {recentOrders.length === 0 ? (
                  <div className="py-8 text-center h-full flex flex-col items-center justify-center">
                    <ShoppingBag className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground font-medium">No orders yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Orders will appear here once customers place them</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {recentOrders.map((order, index) => {
                    const statusColors: Record<string, string> = {
                      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                      payment_pending: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                      payment_verified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                      completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
                      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                    };
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group flex items-start gap-2 rounded-md border border-brand-200/50 bg-white p-2.5 transition-all duration-200 hover:border-brand-300 hover:bg-brand-50/50 hover:shadow-sm"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-green-500/10 to-green-600/10 flex-shrink-0 transition-all duration-200 group-hover:from-green-500/20 group-hover:to-green-600/20">
                          <ShoppingBag className="h-3.5 w-3.5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <Link
                              href={`/staff/orders/${order.id}`}
                              className="text-sm font-semibold text-foreground transition-colors group-hover:text-brand-700 hover:underline"
                            >
                              {order.payment_reference}
                            </Link>
                            <Badge className={`${statusColors[order.status] || ""} text-xs px-2 py-0.5`}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="font-medium text-foreground">{order.user?.name || "Guest"}</span>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="font-semibold text-brand-600">
                              {new Intl.NumberFormat("en-US", {
                                style: "currency",
                                currency: "MYR",
                                minimumFractionDigits: 2,
                              }).format(Number(order.total))}
                            </span>
                            <span className="text-muted-foreground/40">•</span>
                            <span className="text-muted-foreground/70">{format(new Date(order.created_at), "MMM d, h:mm a")}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  </div>
                )}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-3 flex-shrink-0"
              >
                <Link
                  href="/staff/orders"
                  className="group relative flex w-full items-center justify-between rounded-md border border-brand-200/50 bg-white px-3 py-2 text-xs font-medium text-brand-700 transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-3.5 w-3.5 text-brand-600" />
                    <span>View All Orders</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem className="w-full">
          <Card className="h-full w-full border border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-sm flex flex-col">
            <CardHeader className="flex-shrink-0 pt-3 px-3 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-brand-700">
                  Recent Activity
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-3 px-3 pb-3 flex-1 flex flex-col">
              <div className="flex-1 min-h-0">
                {recentActivity.length === 0 ? (
                  <div className="py-8 text-center h-full flex flex-col items-center justify-center">
                    <Activity className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground font-medium">No recent activity</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Activity logs will appear here as you work</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {recentActivity.slice(0, 5).map((log, index) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group flex items-start gap-2 rounded-md border border-brand-200/50 bg-white p-2.5 transition-all duration-200 hover:border-brand-300 hover:bg-brand-50/50 hover:shadow-sm"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-brand-500/10 to-brand-600/10 flex-shrink-0 transition-all duration-200 group-hover:from-brand-500/20 group-hover:to-brand-600/20">
                        <Clock className="h-3.5 w-3.5 text-brand-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground transition-colors group-hover:text-brand-700">
                          {log.action}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                          <Badge variant="outline" className="h-5 border-brand-200/50 bg-brand-50/50 px-2 text-xs font-normal">
                            {log.entityName}
                          </Badge>
                          <span className="text-muted-foreground/60">by</span>
                          <span className="font-medium text-brand-600">{log.userName}</span>
                          <span className="text-muted-foreground/40">•</span>
                          <span className="text-muted-foreground/70">{formatDate(log.timestamp)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  </div>
                )}
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-3 flex-shrink-0"
              >
                <Link
                  href="/staff/activity"
                  className="group relative flex w-full items-center justify-between rounded-md border border-brand-200/50 bg-white px-3 py-2 text-xs font-medium text-brand-700 transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-brand-600" />
                    <span>View All Activity</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </CardContent>
          </Card>
        </StaggerItem>
          </div>
        </StaggerItem>
    </StaggerAnimation>
    </div>
  );
}

