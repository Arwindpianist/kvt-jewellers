"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Clock, User, FileText, TrendingUp, Package, Settings, Download } from "lucide-react";
import type { ActivityLog, ActivityType } from "@/types/activity-log";

const activityTypeIcons: Record<ActivityType, typeof Clock> = {
  price_updated: TrendingUp,
  price_published: TrendingUp,
  price_unpublished: TrendingUp,
  product_created: Package,
  product_updated: Package,
  product_deleted: Package,
  bulk_update: TrendingUp,
  settings_changed: Settings,
};

const activityTypeLabels: Record<ActivityType, string> = {
  price_updated: "Price Updated",
  price_published: "Price Published",
  price_unpublished: "Price Unpublished",
  product_created: "Product Created",
  product_updated: "Product Updated",
  product_deleted: "Product Deleted",
  bulk_update: "Bulk Update",
  settings_changed: "Settings Changed",
};

export function ActivityLog() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "all" as ActivityType | "all",
    entityType: "all" as "price" | "product" | "system" | "all",
    limit: "50",
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type && filters.type !== "all") params.append("type", filters.type);
      if (filters.entityType && filters.entityType !== "all") params.append("entityType", filters.entityType);
      if (filters.limit) params.append("limit", filters.limit);

      const response = await fetch(`/api/activity-logs?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const exportLogs = () => {
    const csv = [
      ["Timestamp", "User", "Type", "Entity", "Action", "Changes"].join(","),
      ...logs.map((log) => [
        formatDate(log.timestamp),
        log.userName,
        activityTypeLabels[log.type],
        log.entityName,
        log.action,
        log.changes ? JSON.stringify(log.changes) : "",
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatedSection>
      <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
        <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="font-serif text-2xl font-semibold text-brand-700">
              Activity Log
            </CardTitle>
            <Button
              onClick={exportLogs}
              variant="outline"
              size="sm"
              className="rounded-lg border-brand-300"
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="type-filter" className="text-sm font-medium">Activity Type</Label>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters({ ...filters, type: value as ActivityType | "all" })}
              >
                <SelectTrigger id="type-filter" className="mt-1 border-brand-300">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(activityTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="entity-filter" className="text-sm font-medium">Entity Type</Label>
              <Select
                value={filters.entityType}
                onValueChange={(value) => setFilters({ ...filters, entityType: value as any })}
              >
                <SelectTrigger id="entity-filter" className="mt-1 border-brand-300">
                  <SelectValue placeholder="All Entities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  <SelectItem value="price">Prices</SelectItem>
                  <SelectItem value="product">Products</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="limit" className="text-sm font-medium">Limit</Label>
              <Input
                id="limit"
                type="number"
                value={filters.limit}
                onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
                className="mt-1 border-brand-300"
                min="10"
                max="500"
              />
            </div>
          </div>

          {/* Logs List */}
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">Loading activity logs...</div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No activity logs found</div>
          ) : (
            <div className="space-y-3">
              {logs.map((log, index) => {
                const Icon = activityTypeIcons[log.type] || FileText;
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-lg border border-brand-200/50 bg-white p-4 hover:bg-brand-50/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex-shrink-0">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge variant="outline" className="border-brand-300 bg-brand-50 text-brand-700">
                            {activityTypeLabels[log.type]}
                          </Badge>
                          <span className="text-sm font-medium text-brand-700">{log.entityName}</span>
                          <span className="text-sm text-muted-foreground">by</span>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <span>{log.userName}</span>
                          </div>
                        </div>
                        <p className="text-sm text-foreground mb-2">{log.action}</p>
                        {log.changes && Object.keys(log.changes).length > 0 && (
                          <div className="mt-2 rounded border border-brand-200/50 bg-brand-50/50 p-2 text-xs">
                            <div className="font-semibold text-brand-700 mb-1">Changes:</div>
                            <div className="space-y-1">
                              {Object.entries(log.changes).map(([key, change]) => (
                                <div key={key} className="flex items-center gap-2">
                                  <span className="font-medium">{key}:</span>
                                  <span className="text-red-600 line-through">
                                    {change.from !== undefined && change.from !== null
                                      ? String(change.from)
                                      : "N/A"}
                                  </span>
                                  <span>→</span>
                                  <span className="text-green-600 font-semibold">
                                    {change.to !== undefined && change.to !== null
                                      ? String(change.to)
                                      : "N/A"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatDate(log.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </AnimatedSection>
  );
}
