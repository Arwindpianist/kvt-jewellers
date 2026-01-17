"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedButton } from "@/components/public/AnimatedButton";
import { AnimatedSection } from "@/components/ui/animated-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Percent,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { logger } from "@/lib/logger";
import { categoryConfig } from "@/lib/product-categories";

interface PricingConfig {
  purity_markups: Record<string, number>;
  karat_markups: Record<string, number>;
  metal_type_markups: Record<string, number>;
  category_markups: Record<string, number>;
  base_markup: number;
  labor_markup: number;
  stone_markup: number;
  design_complexity_markups: Record<string, number>;
  currency_adjustments: Record<string, number>;
  enabled: boolean;
}

const defaultConfig: PricingConfig = {
  purity_markups: { "750": 0, "916": 0, "999": 0, "999.9": 0 },
  karat_markups: { "18k": 0, "22k": 0, "24k": 0 },
  metal_type_markups: { gold: 0, silver: 0, platinum: 0, palladium: 0 },
  category_markups: {},
  base_markup: 0,
  labor_markup: 0,
  stone_markup: 0,
  design_complexity_markups: { simple: 0, moderate: 0, complex: 0, intricate: 0 },
  currency_adjustments: { USD: 1.0, MYR: 1.0, INR: 1.0 },
  enabled: true,
};

export function PricingConfigurator() {
  const [config, setConfig] = useState<PricingConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Fetch configuration
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/pricing-config");
      if (!response.ok) {
        throw new Error("Failed to fetch pricing configuration");
      }
      const data = await response.json();
      if (data.config) {
        // Merge with defaults to ensure all fields exist
        setConfig({
          ...defaultConfig,
          ...data.config,
          purity_markups: { ...defaultConfig.purity_markups, ...(data.config.purity_markups || {}) },
          karat_markups: { ...defaultConfig.karat_markups, ...(data.config.karat_markups || {}) },
          metal_type_markups: { ...defaultConfig.metal_type_markups, ...(data.config.metal_type_markups || {}) },
          category_markups: { ...defaultConfig.category_markups, ...(data.config.category_markups || {}) },
          design_complexity_markups: { ...defaultConfig.design_complexity_markups, ...(data.config.design_complexity_markups || {}) },
          currency_adjustments: { ...defaultConfig.currency_adjustments, ...(data.config.currency_adjustments || {}) },
        });
      } else {
        setConfig(defaultConfig);
      }
    } catch (error) {
      logger.error("Error fetching pricing config", error);
      setError("Failed to load pricing configuration");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/pricing-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save configuration");
      }

      setSuccess("Pricing configuration saved successfully!");
      setTimeout(() => setSuccess(""), 5000);
    } catch (error) {
      logger.error("Error saving pricing config", error);
      setError(error instanceof Error ? error.message : "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const updateNestedConfig = (
    key: keyof PricingConfig,
    nestedKey: string,
    value: number
  ) => {
    setConfig((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] as Record<string, number>),
        [nestedKey]: value,
      },
    }));
  };

  const updateConfig = (key: keyof PricingConfig, value: number | boolean) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AnimatedSection>
      <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
        <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-serif text-xl font-semibold text-brand-700 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Master Pricing Configurator
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure markups and adjustments that apply to all product pricing
              </p>
            </div>
            <Badge variant={config.enabled ? "default" : "secondary"}>
              {config.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="config-enabled"
              checked={config.enabled}
              onChange={(e) => updateConfig("enabled", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="config-enabled" className="font-medium cursor-pointer">
              Enable pricing configuration
            </Label>
          </div>

          <Tabs defaultValue="purity" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="purity">Purity</TabsTrigger>
              <TabsTrigger value="metal">Metal Type</TabsTrigger>
              <TabsTrigger value="category">Category</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
              <TabsTrigger value="currency">Currency</TabsTrigger>
            </TabsList>

            {/* Purity Markups */}
            <TabsContent value="purity" className="space-y-4 mt-4">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 mb-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-amber-600 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Purity markups are applied as a percentage on top of the base metal price.
                    For example, a 5% markup on 916 gold means the price will be 5% higher than the base 916 gold price.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(config.purity_markups).map((purity) => (
                  <div key={purity}>
                    <Label htmlFor={`purity-${purity}`} className="text-sm font-medium">
                      {purity} Purity (%)
                    </Label>
                    <Input
                      id={`purity-${purity}`}
                      type="number"
                      step="0.1"
                      value={config.purity_markups[purity]}
                      onChange={(e) =>
                        updateNestedConfig("purity_markups", purity, parseFloat(e.target.value) || 0)
                      }
                      className="mt-1 border-brand-300 focus:border-brand-500"
                    />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {Object.keys(config.karat_markups).map((karat) => (
                  <div key={karat}>
                    <Label htmlFor={`karat-${karat}`} className="text-sm font-medium">
                      {karat} Karat (%)
                    </Label>
                    <Input
                      id={`karat-${karat}`}
                      type="number"
                      step="0.1"
                      value={config.karat_markups[karat]}
                      onChange={(e) =>
                        updateNestedConfig("karat_markups", karat, parseFloat(e.target.value) || 0)
                      }
                      className="mt-1 border-brand-300 focus:border-brand-500"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Metal Type Markups */}
            <TabsContent value="metal" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.keys(config.metal_type_markups).map((metal) => (
                  <div key={metal}>
                    <Label htmlFor={`metal-${metal}`} className="text-sm font-medium capitalize">
                      {metal} (%)
                    </Label>
                    <Input
                      id={`metal-${metal}`}
                      type="number"
                      step="0.1"
                      value={config.metal_type_markups[metal]}
                      onChange={(e) =>
                        updateNestedConfig("metal_type_markups", metal, parseFloat(e.target.value) || 0)
                      }
                      className="mt-1 border-brand-300 focus:border-brand-500"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* Category Markups */}
            <TabsContent value="category" className="space-y-4 mt-4">
              <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 mb-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Category markups allow you to set different pricing adjustments for different product categories.
                    Leave at 0 to use default pricing.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.keys(categoryConfig).map((category) => {
                  const categoryLabel = categoryConfig[category as keyof typeof categoryConfig]?.label || category;
                  const currentValue = config.category_markups[category] || 0;
                  return (
                    <div key={category}>
                      <Label htmlFor={`category-${category}`} className="text-sm font-medium">
                        {categoryLabel} (%)
                      </Label>
                      <Input
                        id={`category-${category}`}
                        type="number"
                        step="0.1"
                        value={currentValue}
                        onChange={(e) =>
                          updateNestedConfig("category_markups", category, parseFloat(e.target.value) || 0)
                        }
                        className="mt-1 border-brand-300 focus:border-brand-500"
                      />
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            {/* Other Markups */}
            <TabsContent value="other" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="base-markup" className="text-sm font-medium flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Base Markup (%)
                  </Label>
                  <Input
                    id="base-markup"
                    type="number"
                    step="0.1"
                    value={config.base_markup}
                    onChange={(e) => updateConfig("base_markup", parseFloat(e.target.value) || 0)}
                    className="mt-1 border-brand-300 focus:border-brand-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Applied to all products
                  </p>
                </div>
                <div>
                  <Label htmlFor="labor-markup" className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Labor/Making Charge (%)
                  </Label>
                  <Input
                    id="labor-markup"
                    type="number"
                    step="0.1"
                    value={config.labor_markup}
                    onChange={(e) => updateConfig("labor_markup", parseFloat(e.target.value) || 0)}
                    className="mt-1 border-brand-300 focus:border-brand-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Default labor charge markup
                  </p>
                </div>
                <div>
                  <Label htmlFor="stone-markup" className="text-sm font-medium flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Stone Markup (%)
                  </Label>
                  <Input
                    id="stone-markup"
                    type="number"
                    step="0.1"
                    value={config.stone_markup}
                    onChange={(e) => updateConfig("stone_markup", parseFloat(e.target.value) || 0)}
                    className="mt-1 border-brand-300 focus:border-brand-500"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Applied to products with stones
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <Label className="text-sm font-medium mb-3 block">Design Complexity Markups (%)</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.keys(config.design_complexity_markups).map((complexity) => (
                    <div key={complexity}>
                      <Label htmlFor={`complexity-${complexity}`} className="text-sm font-medium capitalize">
                        {complexity} (%)
                      </Label>
                      <Input
                        id={`complexity-${complexity}`}
                        type="number"
                        step="0.1"
                        value={config.design_complexity_markups[complexity]}
                        onChange={(e) =>
                          updateNestedConfig("design_complexity_markups", complexity, parseFloat(e.target.value) || 0)
                        }
                        className="mt-1 border-brand-300 focus:border-brand-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Currency Adjustments */}
            <TabsContent value="currency" className="space-y-4 mt-4">
              <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 mb-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-purple-600 mt-0.5" />
                  <p className="text-sm text-purple-800">
                    Currency adjustments are multipliers applied to the final price.
                    A value of 1.0 means no adjustment, 1.1 means 10% increase, 0.9 means 10% decrease.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.keys(config.currency_adjustments).map((currency) => (
                  <div key={currency}>
                    <Label htmlFor={`currency-${currency}`} className="text-sm font-medium">
                      {currency} Multiplier
                    </Label>
                    <Input
                      id={`currency-${currency}`}
                      type="number"
                      step="0.01"
                      value={config.currency_adjustments[currency]}
                      onChange={(e) =>
                        updateNestedConfig("currency_adjustments", currency, parseFloat(e.target.value) || 1.0)
                      }
                      className="mt-1 border-brand-300 focus:border-brand-500"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <Button
              variant="outline"
              onClick={fetchConfig}
              disabled={saving}
            >
              Reset
            </Button>
            <AnimatedButton
              onClick={handleSave}
              disabled={saving}
              className="gold-gradient-button"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Save Configuration
                </>
              )}
            </AnimatedButton>
          </div>
        </CardContent>
      </Card>
    </AnimatedSection>
  );
}
