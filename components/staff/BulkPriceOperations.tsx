"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedButton } from "@/components/public/AnimatedButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Percent, DollarSign, CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";
import type { GoldPrice } from "@/types/gold-prices";

interface BulkPriceOperationsProps {
  prices: GoldPrice[];
  onUpdate: () => void;
}

export function BulkPriceOperations({ prices, onUpdate }: BulkPriceOperationsProps) {
  const [percentageChange, setPercentageChange] = useState("");
  const [fixedAmount, setFixedAmount] = useState("");
  const [selectedAction, setSelectedAction] = useState<"percentage" | "fixed" | "publish" | "unpublish" | "buyPct" | "sellPct">("percentage");
  const [targetType, setTargetType] = useState<"all" | "gold" | "silver" | "exchange">("all");
  const [buyPercentage, setBuyPercentage] = useState("");
  const [sellPercentage, setSellPercentage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; affected: number } | null>(null);

  const getFilteredPrices = () => {
    if (targetType === "all") return prices;
    if (targetType === "gold") return prices.filter((p) => p.type.includes("GOLD"));
    if (targetType === "silver") return prices.filter((p) => p.type.includes("SILVER"));
    if (targetType === "exchange") return prices.filter((p) => p.type.includes("MYR") || p.type.includes("USD") || p.type.includes("INR"));
    return prices;
  };

  const filteredPrices = getFilteredPrices();

  const handleBulkUpdate = async () => {
    if (filteredPrices.length === 0) {
      setResult({ success: false, message: "No prices match the selected filter", affected: 0 });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const updates: Array<{ priceId: string; data: any }> = [];

      for (const price of filteredPrices) {
        let updateData: any = {};

        switch (selectedAction) {
          case "percentage":
            if (!percentageChange) {
              setResult({ success: false, message: "Please enter a percentage value", affected: 0 });
              setLoading(false);
              return;
            }
            const pct = parseFloat(percentageChange);
            const currentPrice = price.overridePrice ?? price.fetchedPrice;
            updateData.overridePrice = currentPrice * (1 + pct / 100);
            break;

          case "fixed":
            if (!fixedAmount) {
              setResult({ success: false, message: "Please enter a fixed amount", affected: 0 });
              setLoading(false);
              return;
            }
            updateData.overridePrice = parseFloat(fixedAmount);
            break;

          case "publish":
            updateData.isPublished = true;
            break;

          case "unpublish":
            updateData.isPublished = false;
            break;

          case "buyPct":
            if (!buyPercentage) {
              setResult({ success: false, message: "Please enter a buy percentage", affected: 0 });
              setLoading(false);
              return;
            }
            updateData.buyPercentage = parseFloat(buyPercentage);
            break;

          case "sellPct":
            if (!sellPercentage) {
              setResult({ success: false, message: "Please enter a sell percentage", affected: 0 });
              setLoading(false);
              return;
            }
            updateData.sellPercentage = parseFloat(sellPercentage);
            break;
        }

        updates.push({ priceId: price.id, data: updateData });
      }

      // Apply updates sequentially
      let successCount = 0;
      let errorCount = 0;

      for (const update of updates) {
        try {
          const response = await fetch("/api/gold-prices/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              priceId: update.priceId,
              isBulk: true,
              ...update.data,
            }),
          });

          if (response.ok) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }
      }

      if (successCount > 0) {
        setResult({
          success: true,
          message: `Successfully updated ${successCount} price${successCount > 1 ? "s" : ""}${errorCount > 0 ? ` (${errorCount} failed)` : ""}`,
          affected: successCount,
        });
        // Refresh prices
        onUpdate();
        // Reset form
        setPercentageChange("");
        setFixedAmount("");
        setBuyPercentage("");
        setSellPercentage("");
      } else {
        setResult({
          success: false,
          message: `Failed to update prices. ${errorCount} error${errorCount > 1 ? "s" : ""} occurred.`,
          affected: 0,
        });
      }
    } catch (error) {
      console.error("Error performing bulk update:", error);
      setResult({
        success: false,
        message: "An error occurred while performing bulk update",
        affected: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
        <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
          <CardTitle className="font-serif text-xl font-semibold text-brand-700">
            Bulk Price Operations
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Filter Selection */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-2 block">Target Prices</Label>
            <div className="flex flex-wrap gap-2">
              {(["all", "gold", "silver", "exchange"] as const).map((type) => (
                <Button
                  key={type}
                  variant={targetType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTargetType(type)}
                  className={targetType === type ? "gold-gradient-button" : "border-brand-300"}
                >
                  {type === "all" ? "All Prices" : type === "gold" ? "Gold Only" : type === "silver" ? "Silver Only" : "Exchange Rates"}
                </Button>
              ))}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {filteredPrices.length} price{filteredPrices.length !== 1 ? "s" : ""} will be affected
            </p>
          </div>

          {/* Action Selection */}
          <div className="mb-6">
            <Label className="text-sm font-medium mb-2 block">Operation Type</Label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <Button
                variant={selectedAction === "percentage" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAction("percentage")}
                className={selectedAction === "percentage" ? "gold-gradient-button" : "border-brand-300"}
              >
                <Percent className="mr-2 h-4 w-4" />
                Percentage
              </Button>
              <Button
                variant={selectedAction === "fixed" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAction("fixed")}
                className={selectedAction === "fixed" ? "gold-gradient-button" : "border-brand-300"}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Fixed Amount
              </Button>
              <Button
                variant={selectedAction === "publish" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAction("publish")}
                className={selectedAction === "publish" ? "bg-green-600 hover:bg-green-700 text-white" : "border-brand-300"}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Publish All
              </Button>
              <Button
                variant={selectedAction === "unpublish" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAction("unpublish")}
                className={selectedAction === "unpublish" ? "bg-red-600 hover:bg-red-700 text-white" : "border-brand-300"}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Unpublish All
              </Button>
              <Button
                variant={selectedAction === "buyPct" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAction("buyPct")}
                className={selectedAction === "buyPct" ? "gold-gradient-button" : "border-brand-300"}
              >
                Buy %
              </Button>
              <Button
                variant={selectedAction === "sellPct" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedAction("sellPct")}
                className={selectedAction === "sellPct" ? "gold-gradient-button" : "border-brand-300"}
              >
                Sell %
              </Button>
            </div>
          </div>

          {/* Input Fields */}
          {(selectedAction === "percentage" || selectedAction === "fixed" || selectedAction === "buyPct" || selectedAction === "sellPct") && (
            <div className="mb-6">
              {selectedAction === "percentage" && (
                <div>
                  <Label htmlFor="percentage" className="text-sm font-medium">
                    Percentage Change (%)
                  </Label>
                  <Input
                    id="percentage"
                    type="number"
                    step="0.01"
                    value={percentageChange}
                    onChange={(e) => setPercentageChange(e.target.value)}
                    placeholder="e.g., 5 for +5%, -3 for -3%"
                    className="mt-1 border-brand-300"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Positive values increase prices, negative values decrease
                  </p>
                </div>
              )}

              {selectedAction === "fixed" && (
                <div>
                  <Label htmlFor="fixed" className="text-sm font-medium">
                    Fixed Price Amount
                  </Label>
                  <Input
                    id="fixed"
                    type="number"
                    step="0.01"
                    value={fixedAmount}
                    onChange={(e) => setFixedAmount(e.target.value)}
                    placeholder="Enter fixed price"
                    className="mt-1 border-brand-300"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Sets all selected prices to this exact value
                  </p>
                </div>
              )}

              {selectedAction === "buyPct" && (
                <div>
                  <Label htmlFor="buyPct" className="text-sm font-medium">
                    Buy Percentage (%)
                  </Label>
                  <Input
                    id="buyPct"
                    type="number"
                    step="0.01"
                    value={buyPercentage}
                    onChange={(e) => setBuyPercentage(e.target.value)}
                    placeholder="e.g., 2.5 for 2.5%"
                    className="mt-1 border-brand-300"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Percentage to subtract from base price when buying from customers
                  </p>
                </div>
              )}

              {selectedAction === "sellPct" && (
                <div>
                  <Label htmlFor="sellPct" className="text-sm font-medium">
                    Sell Percentage (%)
                  </Label>
                  <Input
                    id="sellPct"
                    type="number"
                    step="0.01"
                    value={sellPercentage}
                    onChange={(e) => setSellPercentage(e.target.value)}
                    placeholder="e.g., 3.0 for 3%"
                    className="mt-1 border-brand-300"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Percentage to add to base price when selling to customers
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          {selectedAction === "percentage" && percentageChange && (
            <div className="mb-6 rounded-lg border border-brand-200/50 bg-brand-50/50 p-4">
              <Label className="text-sm font-medium mb-2 block">Preview (first 3 prices)</Label>
              <div className="space-y-2">
                {filteredPrices.slice(0, 3).map((price) => {
                  const currentPrice = price.overridePrice ?? price.fetchedPrice;
                  const newPrice = currentPrice * (1 + parseFloat(percentageChange) / 100);
                  return (
                    <div key={price.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{price.type}</span>
                      <div className="flex items-center gap-2">
                        <span className="line-through text-gray-500">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: price.currency,
                          }).format(currentPrice)}
                        </span>
                        <span className="font-semibold text-green-600">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: price.currency,
                          }).format(newPrice)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Result Alert */}
          {result && (
            <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? "text-green-700" : "text-red-700"}>
                {result.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Execute Button */}
          <AnimatedButton
            onClick={handleBulkUpdate}
            disabled={loading || filteredPrices.length === 0}
            className="w-full gold-gradient-button rounded-lg mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                Apply to {filteredPrices.length} Price{filteredPrices.length !== 1 ? "s" : ""}
              </>
            )}
          </AnimatedButton>
        </CardContent>
      </Card>
    </div>
  );
}
