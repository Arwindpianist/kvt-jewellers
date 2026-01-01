"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedButton } from "@/components/public/AnimatedButton";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Info, ChevronDown, ChevronUp, DollarSign, Percent, Clock, Download, Upload } from "lucide-react";
import { BulkPriceOperations } from "./BulkPriceOperations";
import type { GoldPrice } from "@/types/gold-prices";

interface PriceManagerProps {
  initialPrices: GoldPrice[];
  lastFetched?: Date;
}

const priceTypeLabels: Record<string, string> = {
  GOLD_C: "GOLD - C",
  GOLD_USD: "GOLD ($)",
  SILVER_C: "SILVER - C",
  SILVER_USD: "SILVER ($)",
  SING: "SING",
  MYR_USD: "MYR/USD",
  MYR_INR: "MYR/INR",
};

interface EditData {
  overridePrice?: number;
  isPublished: boolean;
  buyPercentage?: number;
  sellPercentage?: number;
  usePresetExchangeRate?: boolean;
  presetExchangeRate?: number;
}

export function PriceManager({ initialPrices, lastFetched }: PriceManagerProps) {
  const [prices, setPrices] = useState(initialPrices);
  const [editing, setEditing] = useState<Record<string, EditData>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    try {
      const response = await fetch("/api/export/prices");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prices-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting prices:", error);
      alert("Failed to export prices. Please try again.");
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/import/prices", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert(`Successfully imported ${data.imported} prices${data.errors > 0 ? ` (${data.errors} errors)` : ""}`);
        // Refresh prices
        const refreshResponse = await fetch("/api/gold-prices");
        const refreshData = await refreshResponse.json();
        if (refreshData.prices) {
          setPrices(refreshData.prices);
        }
      } else {
        alert(`Import failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error importing prices:", error);
      alert("Failed to import prices. Please try again.");
    } finally {
      setImporting(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const refreshPrices = async () => {
    try {
      const response = await fetch("/api/gold-prices");
      const data = await response.json();
      if (data.prices) {
        setPrices(data.prices);
      }
    } catch (error) {
      console.error("Error refreshing prices:", error);
    }
  };

  const handleEdit = (priceId: string) => {
    const price = prices.find((p) => p.id === priceId);
    if (price) {
      setEditing({
        ...editing,
        [priceId]: {
          overridePrice: price.overridePrice,
          isPublished: price.isPublished,
          buyPercentage: price.buyPercentage ?? 0,
          sellPercentage: price.sellPercentage ?? 0,
          usePresetExchangeRate: price.usePresetExchangeRate ?? false,
          presetExchangeRate: price.presetExchangeRate,
        },
      });
      setExpandedRows(new Set([...expandedRows, priceId]));
    }
  };

  const handleSave = async (priceId: string) => {
    setSaving(priceId);
    const editData = editing[priceId];

    try {
      const response = await fetch("/api/gold-prices/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          overridePrice: editData?.overridePrice,
          isPublished: editData?.isPublished,
          buyPercentage: editData?.buyPercentage,
          sellPercentage: editData?.sellPercentage,
          usePresetExchangeRate: editData?.usePresetExchangeRate,
          presetExchangeRate: editData?.presetExchangeRate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update price");
      }

      const data = await response.json();
      setPrices(data.prices);
      const newEditing = { ...editing };
      delete newEditing[priceId];
      setEditing(newEditing);
      const newExpanded = new Set(expandedRows);
      newExpanded.delete(priceId);
      setExpandedRows(newExpanded);
    } catch (error) {
      console.error("Error updating price:", error);
      alert("Failed to update price. Please try again.");
    } finally {
      setSaving(null);
    }
  };

  const handleCancel = (priceId: string) => {
    const newEditing = { ...editing };
    delete newEditing[priceId];
    setEditing(newEditing);
    const newExpanded = new Set(expandedRows);
    newExpanded.delete(priceId);
    setExpandedRows(newExpanded);
  };

  const displayPrice = (price: GoldPrice) => {
    return price.overridePrice ?? price.fetchedPrice;
  };

  const calculateBuyPrice = (price: GoldPrice, editData?: EditData) => {
    const basePrice = displayPrice(price);
    const buyPct = editData?.buyPercentage ?? price.buyPercentage ?? 0;
    return basePrice * (1 - buyPct / 100);
  };

  const calculateSellPrice = (price: GoldPrice, editData?: EditData) => {
    const basePrice = displayPrice(price);
    const sellPct = editData?.sellPercentage ?? price.sellPercentage ?? 0;
    return basePrice * (1 + sellPct / 100);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: currency === "MYR" ? "MYR" : currency === "INR" ? "INR" : "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const isExchangeRate = (type: string) => {
    return type === "MYR_USD" || type === "MYR_INR";
  };

  return (
    <AnimatedSection>
      <Tabs defaultValue="prices" className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="prices">Price Settings</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Config</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="prices" className="space-y-6">
          <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
            <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="font-serif text-2xl font-semibold text-brand-700">
                  Price Management
                </CardTitle>
                <div className="flex items-center gap-3">
                  {prices.length > 0 && (
                    <div className="flex items-center gap-2 rounded-lg border border-brand-200/50 bg-brand-50/50 px-3 py-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 text-brand-600" />
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="font-medium text-brand-700">
                          Last fetched: {new Date(prices[0]?.lastUpdated || Date.now()).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <AnimatedButton
                      onClick={handleExport}
                      size="sm"
                      variant="outline"
                      className="rounded-lg border-brand-300 hover:bg-brand-50"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export CSV
                    </AnimatedButton>
                    <label className="cursor-pointer">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-lg border-brand-300 hover:bg-brand-50"
                        disabled={importing}
                        asChild
                      >
                        <span>
                          <Upload className="mr-2 h-4 w-4 inline" />
                          {importing ? "Importing..." : "Import CSV"}
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleImport}
                        className="hidden"
                        disabled={importing}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-brand-200/50">
                      <TableHead className="font-semibold text-brand-700">Type</TableHead>
                      <TableHead className="font-semibold text-brand-700">Base Price</TableHead>
                      <TableHead className="font-semibold text-brand-700">Buy Price</TableHead>
                      <TableHead className="font-semibold text-brand-700">Sell Price</TableHead>
                      <TableHead className="font-semibold text-brand-700">Status</TableHead>
                      <TableHead className="font-semibold text-brand-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prices.map((price, index) => {
                      const isEditing = editing[price.id] !== undefined;
                      const editData = editing[price.id];
                      const isExpanded = expandedRows.has(price.id);
                      const basePrice = displayPrice(price);
                      const buyPrice = calculateBuyPrice(price, editData);
                      const sellPrice = calculateSellPrice(price, editData);

                      return (
                        <React.Fragment key={price.id}>
                          <motion.tr
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-brand-100 hover:bg-brand-50/50"
                          >
                            <TableCell className="font-medium">
                              <Badge variant="outline" className="border-brand-300 bg-brand-50 text-brand-700">
                                {priceTypeLabels[price.type] || price.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-semibold gold-gradient-text text-lg">
                                {formatPrice(basePrice, price.currency)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-green-700 font-medium">
                                {formatPrice(buyPrice, price.currency)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-red-700 font-medium">
                                {formatPrice(sellPrice, price.currency)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={price.isPublished ? "default" : "outline"}
                                className={
                                  price.isPublished
                                    ? "bg-green-100 text-green-700 border-green-300"
                                    : "border-gray-300 bg-gray-50 text-gray-600"
                                }
                              >
                                {price.isPublished ? "Published" : "Unpublished"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <div className="flex space-x-2">
                                  <AnimatedButton
                                    size="sm"
                                    onClick={() => handleSave(price.id)}
                                    disabled={saving === price.id}
                                    className="gold-gradient-button rounded-lg"
                                  >
                                    {saving === price.id ? "Saving..." : "Save"}
                                  </AnimatedButton>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleCancel(price.id)}
                                    className="rounded-lg border-brand-300"
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <AnimatedButton
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(price.id)}
                                  className="rounded-lg border-brand-300 hover:bg-brand-50"
                                >
                                  Edit
                                </AnimatedButton>
                              )}
                            </TableCell>
                          </motion.tr>
                          {isEditing && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="border-brand-100 bg-brand-50/30"
                            >
                              <TableCell colSpan={6} className="p-4">
                                <div className="space-y-4">
                                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                      <Label htmlFor={`override-${price.id}`} className="text-sm font-medium">
                                        Override Base Price
                                      </Label>
                                      <Input
                                        id={`override-${price.id}`}
                                        type="number"
                                        step="0.01"
                                        defaultValue={editData?.overridePrice ?? price.overridePrice ?? ""}
                                        onChange={(e) => {
                                          setEditing({
                                            ...editing,
                                            [price.id]: {
                                              ...editData,
                                              overridePrice: e.target.value
                                                ? parseFloat(e.target.value)
                                                : undefined,
                                            },
                                          });
                                        }}
                                        className="mt-1 border-brand-300 focus:border-brand-500"
                                        placeholder="Auto (use fetched price)"
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-sm font-medium flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          checked={editData?.isPublished ?? price.isPublished}
                                          onChange={(e) => {
                                            setEditing({
                                              ...editing,
                                              [price.id]: {
                                                ...editData,
                                                isPublished: e.target.checked,
                                              },
                                            });
                                          }}
                                          className="h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                                        />
                                        <span>Published</span>
                                      </Label>
                                    </div>
                                  </div>

                                  {!isExchangeRate(price.type) && (
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 border-t border-brand-200 pt-4">
                                      <div>
                                        <Label htmlFor={`buy-${price.id}`} className="text-sm font-medium flex items-center gap-2">
                                          <Percent className="h-4 w-4 text-green-600" />
                                          Buy Percentage (%)
                                        </Label>
                                        <Input
                                          id={`buy-${price.id}`}
                                          type="number"
                                          step="0.1"
                                          defaultValue={editData?.buyPercentage ?? price.buyPercentage ?? 0}
                                          onChange={(e) => {
                                            setEditing({
                                              ...editing,
                                              [price.id]: {
                                                ...editData,
                                                buyPercentage: e.target.value
                                                  ? parseFloat(e.target.value)
                                                  : 0,
                                              },
                                            });
                                          }}
                                          className="mt-1 border-brand-300 focus:border-brand-500"
                                          placeholder="0"
                                        />
                                        <p className="mt-1 text-xs text-muted-foreground">
                                          Percentage to subtract from base price
                                        </p>
                                        <p className="text-xs font-semibold text-green-700 mt-1">
                                          Buy Price: {formatPrice(calculateBuyPrice(price, editData), price.currency)}
                                        </p>
                                      </div>
                                      <div>
                                        <Label htmlFor={`sell-${price.id}`} className="text-sm font-medium flex items-center gap-2">
                                          <Percent className="h-4 w-4 text-red-600" />
                                          Sell Percentage (%)
                                        </Label>
                                        <Input
                                          id={`sell-${price.id}`}
                                          type="number"
                                          step="0.1"
                                          defaultValue={editData?.sellPercentage ?? price.sellPercentage ?? 0}
                                          onChange={(e) => {
                                            setEditing({
                                              ...editing,
                                              [price.id]: {
                                                ...editData,
                                                sellPercentage: e.target.value
                                                  ? parseFloat(e.target.value)
                                                  : 0,
                                              },
                                            });
                                          }}
                                          className="mt-1 border-brand-300 focus:border-brand-500"
                                          placeholder="0"
                                        />
                                        <p className="mt-1 text-xs text-muted-foreground">
                                          Percentage to add to base price
                                        </p>
                                        <p className="text-xs font-semibold text-red-700 mt-1">
                                          Sell Price: {formatPrice(calculateSellPrice(price, editData), price.currency)}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {isExchangeRate(price.type) && (
                                    <div className="border-t border-brand-200 pt-4 space-y-4">
                                      <div>
                                        <Label className="text-sm font-medium flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            checked={editData?.usePresetExchangeRate ?? price.usePresetExchangeRate ?? false}
                                            onChange={(e) => {
                                              setEditing({
                                                ...editing,
                                                [price.id]: {
                                                  ...editData,
                                                  usePresetExchangeRate: e.target.checked,
                                                },
                                              });
                                            }}
                                            className="h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-500"
                                          />
                                          <DollarSign className="h-4 w-4" />
                                          Use Preset Exchange Rate
                                        </Label>
                                      </div>
                                      {editData?.usePresetExchangeRate && (
                                        <motion.div
                                          initial={{ opacity: 0, height: 0 }}
                                          animate={{ opacity: 1, height: "auto" }}
                                          className="pl-6"
                                        >
                                          <Label htmlFor={`preset-${price.id}`} className="text-sm font-medium">
                                            Preset Exchange Rate
                                          </Label>
                                          <Input
                                            id={`preset-${price.id}`}
                                            type="number"
                                            step="0.0001"
                                            defaultValue={editData?.presetExchangeRate ?? price.presetExchangeRate ?? ""}
                                            onChange={(e) => {
                                              setEditing({
                                                ...editing,
                                                [price.id]: {
                                                  ...editData,
                                                  presetExchangeRate: e.target.value
                                                    ? parseFloat(e.target.value)
                                                    : undefined,
                                                },
                                              });
                                            }}
                                            className="mt-1 border-brand-300 focus:border-brand-500"
                                            placeholder="Enter exchange rate"
                                          />
                                          <p className="mt-1 text-xs text-muted-foreground">
                                            Manual exchange rate override
                                          </p>
                                        </motion.div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </motion.tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 flex items-start gap-3 rounded-lg border border-brand-200/50 bg-brand-50/50 p-4"
              >
                <Info className="mt-0.5 h-5 w-5 text-brand-600" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-semibold text-brand-700">Note:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Override prices will replace fetched prices on the public site.</li>
                    <li>Buy/Sell percentages are calculated from the base price.</li>
                    <li>Unpublished prices will not be visible to customers.</li>
                    <li>Exchange rates can be set manually or use fetched rates.</li>
                  </ul>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
            <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
              <CardTitle className="font-serif text-2xl font-semibold text-brand-700">
                Advanced Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Advanced settings allow you to configure buy/sell margins and exchange rate overrides
                  for more precise price control.
                </p>
                <div className="rounded-lg border border-brand-200/50 bg-brand-50/50 p-4">
                  <h4 className="font-semibold text-brand-700 mb-2">Buy/Sell Percentages</h4>
                  <p className="mb-2">
                    Configure percentage margins for buying and selling:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>Buy Percentage:</strong> Amount to subtract from base price when buying from customers</li>
                    <li><strong>Sell Percentage:</strong> Amount to add to base price when selling to customers</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-brand-200/50 bg-brand-50/50 p-4">
                  <h4 className="font-semibold text-brand-700 mb-2">Preset Exchange Rates</h4>
                  <p>
                    For exchange rate types (MYR/USD, MYR/INR), you can set a fixed exchange rate
                    instead of using the fetched rate. This is useful for maintaining consistent
                    pricing during market volatility.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <BulkPriceOperations prices={prices} onUpdate={refreshPrices} />
        </TabsContent>
      </Tabs>
    </AnimatedSection>
  );
}
