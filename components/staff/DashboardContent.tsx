"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedButton } from "@/components/public/AnimatedButton";
import { StaggerAnimation, StaggerItem } from "@/components/ui/stagger-animation";
import { HoverCard } from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";
import { TrendingUp, Package, Zap, ArrowRight, Clock, FileText, DollarSign, AlertCircle, CheckCircle2, BarChart3, Activity } from "lucide-react";
import type { GoldPrice } from "@/types/gold-prices";
import type { Product } from "@/types/products";
import type { ActivityLog } from "@/types/activity-log";

interface DashboardContentProps {
  userName: string;
  publishedPrices: GoldPrice[];
  allPrices: GoldPrice[];
  products: Product[];
  recentActivity: ActivityLog[];
  allActivityLogs: ActivityLog[];
}

export function DashboardContent({
  userName,
  publishedPrices,
  allPrices,
  products,
  recentActivity,
  allActivityLogs,
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

  // Calculate insights
  const insights = useMemo(() => {
    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);
    const activity24h = allActivityLogs.filter((log) => new Date(log.timestamp) >= last24h);
    
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
    };
  }, [allPrices, publishedPrices, products, allActivityLogs]);
  return (
    <StaggerAnimation>
      {/* Key Metrics Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StaggerItem>
          <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
            <CardHeader className="bg-gradient-to-br from-brand-50 to-white pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Activity (24h)</CardTitle>
                <Activity className="h-4 w-4 text-brand-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gold-gradient-text">{insights.activity24h}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {insights.priceUpdates24h} price updates, {insights.productUpdates24h} product updates
              </p>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
            <CardHeader className="bg-gradient-to-br from-brand-50 to-white pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Price</CardTitle>
                <DollarSign className="h-4 w-4 text-brand-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gold-gradient-text">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "MYR",
                  minimumFractionDigits: 0,
                }).format(insights.avgPrice)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Average published price</p>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
            <CardHeader className="bg-gradient-to-br from-brand-50 to-white pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unpublished</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{insights.unpublishedCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Prices not yet published</p>
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem>
          <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
            <CardHeader className="bg-gradient-to-br from-brand-50 to-white pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Price Types</CardTitle>
                <BarChart3 className="h-4 w-4 text-brand-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gold:</span>
                  <span className="font-semibold">{insights.goldPrices}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Silver:</span>
                  <span className="font-semibold">{insights.silverPrices}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exchange:</span>
                  <span className="font-semibold">{insights.exchangeRates}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      </div>

      {/* Main Cards Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StaggerItem>
          <HoverCard>
            <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated transition-all hover:bg-card-level-3 hover:shadow-card-floating">
              <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-xl font-semibold text-brand-700">
                    Published Prices
                  </CardTitle>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <motion.div
                  className="text-4xl font-bold gold-gradient-text"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                >
                  {publishedPrices.length}
                </motion.div>
                <p className="mt-2 text-sm text-muted-foreground">
                  out of <span className="font-semibold">{allPrices.length}</span> total prices
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    {publishedPrices.length} Active
                  </Badge>
                  {insights.unpublishedCount > 0 && (
                    <Badge variant="outline" className="border-orange-200 bg-orange-50 text-orange-700">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {insights.unpublishedCount} Pending
                    </Badge>
                  )}
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link
                    href="/staff/prices"
                    className="group relative mt-6 flex w-full items-center justify-between rounded-xl border-2 border-brand-200/50 bg-gradient-to-r from-white to-brand-50/30 p-4 transition-all duration-300 hover:border-brand-300 hover:shadow-md hover:shadow-brand-200/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 shadow-sm transition-transform duration-300 group-hover:scale-105">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-brand-700 transition-colors group-hover:text-brand-800">
                        Manage Prices
                      </span>
                    </div>
                    <motion.div
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-600 transition-colors group-hover:bg-brand-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </motion.div>
                  </Link>
                </motion.div>
              </CardContent>
            </Card>
          </HoverCard>
        </StaggerItem>

        <StaggerItem>
          <HoverCard>
            <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated transition-all hover:bg-card-level-3 hover:shadow-card-floating">
              <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-xl font-semibold text-brand-700">
                    Total Products
                  </CardTitle>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <motion.div
                  className="text-4xl font-bold gold-gradient-text"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  {products.length}
                </motion.div>
                <p className="mt-2 text-sm text-muted-foreground">
                  products in catalog
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(insights.productsByCategory).map(([category, count]) => (
                    <Badge key={category} variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                      {category}: {count}
                    </Badge>
                  ))}
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    href="/staff/products"
                    className="group relative mt-6 flex w-full items-center justify-between rounded-xl border-2 border-brand-200/50 bg-gradient-to-r from-white to-brand-50/30 p-4 transition-all duration-300 hover:border-brand-300 hover:shadow-md hover:shadow-brand-200/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm transition-transform duration-300 group-hover:scale-105">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold text-brand-700 transition-colors group-hover:text-brand-800">
                        Manage Products
                      </span>
                    </div>
                    <motion.div
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-600 transition-colors group-hover:bg-brand-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </motion.div>
                  </Link>
                </motion.div>
              </CardContent>
            </Card>
          </HoverCard>
        </StaggerItem>

        <StaggerItem>
          <HoverCard>
            <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated transition-all hover:bg-card-level-3 hover:shadow-card-floating">
              <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-xl font-semibold text-brand-700">
                    Quick Actions
                  </CardTitle>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold-500 to-gold-600">
                    <Zap className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                <Link
                  href="/staff/prices"
                  className="group relative flex w-full items-center justify-between rounded-xl border-2 border-transparent bg-gradient-to-r from-gold-500 to-gold-600 p-4 text-white shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-gold-500/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <span className="font-semibold">Update Prices</span>
                  </div>
                  <motion.div
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.div>
                </Link>
                <Link
                  href="/staff/products"
                  className="group relative flex w-full items-center justify-between rounded-xl border-2 border-brand-200/50 bg-gradient-to-r from-white to-brand-50/30 p-4 transition-all duration-300 hover:border-brand-300 hover:shadow-md hover:shadow-brand-200/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-400 to-slate-500 shadow-sm">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-brand-700">Add Product</span>
                  </div>
                  <motion.div
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-600 transition-colors group-hover:bg-brand-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </motion.div>
                </Link>
              </CardContent>
            </Card>
          </HoverCard>
        </StaggerItem>
      </div>

      {/* Recent Activity Section */}
      <StaggerItem>
        <Card className="mt-8 border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
          <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-xl font-semibold text-brand-700">
                Recent Activity
              </CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600">
                <FileText className="h-5 w-5 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {recentActivity.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No recent activity
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group flex items-start gap-3 rounded-lg border border-brand-200/50 bg-white p-3.5 transition-all duration-200 hover:border-brand-300 hover:bg-gradient-to-r hover:from-brand-50/50 hover:to-white hover:shadow-sm"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500/10 to-brand-600/10 flex-shrink-0 transition-all duration-200 group-hover:from-brand-500/20 group-hover:to-brand-600/20">
                      <Clock className="h-4.5 w-4.5 text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground transition-colors group-hover:text-brand-700">
                        {log.action}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link
                href="/staff/activity"
                className="group relative mt-6 flex w-full items-center justify-between rounded-xl border-2 border-brand-200/50 bg-gradient-to-r from-white to-brand-50/30 p-4 transition-all duration-300 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-200/50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-brand-700 transition-colors group-hover:text-brand-800">
                      View All Activity
                    </p>
                    <p className="text-xs text-muted-foreground">
                      See complete activity history and audit trail
                    </p>
                  </div>
                </div>
                <motion.div
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-600 transition-colors group-hover:bg-brand-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.div>
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </StaggerItem>

      {/* Quick Links Row */}
      <StaggerItem>
        <Card className="mt-8 border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
          <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
            <div className="flex items-center justify-between">
              <CardTitle className="font-serif text-xl font-semibold text-brand-700">
                Quick Links
              </CardTitle>
              <Badge variant="outline" className="border-brand-300 bg-brand-50 text-brand-700">
                Navigation
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  href: "/staff/prices",
                  icon: TrendingUp,
                  title: "Manage Prices",
                  description: "Update and configure pricing",
                  gradient: "from-brand-500 to-brand-600",
                  bgGradient: "from-brand-50 to-brand-100/50",
                },
                {
                  href: "/staff/products",
                  icon: Package,
                  title: "Manage Products",
                  description: "Catalog management",
                  gradient: "from-blue-500 to-blue-600",
                  bgGradient: "from-blue-50 to-blue-100/50",
                },
                {
                  href: "/staff/analytics",
                  icon: BarChart3,
                  title: "Analytics",
                  description: "Reports & insights",
                  gradient: "from-purple-500 to-purple-600",
                  bgGradient: "from-purple-50 to-purple-100/50",
                },
                {
                  href: "/staff/activity",
                  icon: FileText,
                  title: "Activity Log",
                  description: "Audit trail & history",
                  gradient: "from-amber-500 to-amber-600",
                  bgGradient: "from-amber-50 to-amber-100/50",
                },
              ].map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className="group relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-brand-200/50 bg-gradient-to-br p-6 transition-all duration-300 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-200/30"
                      style={{
                        background: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                      }}
                    >
                      <div
                        className={`absolute inset-0 rounded-xl bg-gradient-to-br ${link.bgGradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                      />
                      <div className="relative z-10 flex flex-col items-center gap-3">
                        <motion.div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${link.gradient} shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                          whileHover={{ rotate: [0, -5, 5, 0] }}
                          transition={{ duration: 0.5 }}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </motion.div>
                        <div className="text-center">
                          <p className="font-semibold text-brand-700 transition-colors group-hover:text-brand-800">
                            {link.title}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {link.description}
                          </p>
                        </div>
                        <motion.div
                          className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-100 text-brand-600 opacity-0 transition-all group-hover:opacity-100"
                          whileHover={{ scale: 1.1 }}
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </motion.div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerAnimation>
  );
}

