"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { PricingModel } from "@/types/products";

interface PricingModelSelectorProps {
  pricingModel: PricingModel;
  onPricingModelChange: (model: PricingModel) => void;
  baseWeight?: number;
  onBaseWeightChange: (weight: number | undefined) => void;
  basePurity?: string;
  onBasePurityChange: (purity: string | undefined) => void;
  basePrice?: number;
  onBasePriceChange: (price: number | undefined) => void;
  purityOptions?: string[];
}

export function PricingModelSelector({
  pricingModel,
  onPricingModelChange,
  baseWeight,
  onBaseWeightChange,
  basePurity,
  onBasePurityChange,
  basePrice,
  onBasePriceChange,
  purityOptions = ["750", "916", "999", "999.9"],
}: PricingModelSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-3 block">Pricing Model</Label>
        <RadioGroup
          value={pricingModel}
          onValueChange={(value) => onPricingModelChange(value as PricingModel)}
          className="space-y-3"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fixed" id="pricing-fixed" />
            <Label htmlFor="pricing-fixed" className="font-normal cursor-pointer">
              Fixed Price - Set a static price for this product
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dynamic" id="pricing-dynamic" />
            <Label htmlFor="pricing-dynamic" className="font-normal cursor-pointer">
              Dynamic - Price calculated from current metal market rates
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hybrid" id="pricing-hybrid" />
            <Label htmlFor="pricing-hybrid" className="font-normal cursor-pointer">
              Hybrid - Metal price + additional price (set per variant)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Fixed Pricing Fields */}
      {pricingModel === "fixed" && (
        <div>
          <Label htmlFor="base-price" className="text-sm font-medium">
            Base Price (MYR)
          </Label>
          <Input
            id="base-price"
            type="number"
            step="0.01"
            value={basePrice || ""}
            onChange={(e) =>
              onBasePriceChange(e.target.value ? parseFloat(e.target.value) : undefined)
            }
            className="mt-1 border-brand-300 focus:border-brand-500"
            placeholder="0.00"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            This price will be used for all variants (unless variant has its own base price)
          </p>
        </div>
      )}

      {/* Dynamic/Hybrid Pricing Fields */}
      {(pricingModel === "dynamic" || pricingModel === "hybrid") && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="base-weight" className="text-sm font-medium">
              Base Weight (grams)
            </Label>
            <Input
              id="base-weight"
              type="number"
              step="0.1"
              value={baseWeight || ""}
              onChange={(e) =>
                onBaseWeightChange(e.target.value ? parseFloat(e.target.value) : undefined)
              }
              className="mt-1 border-brand-300 focus:border-brand-500"
              placeholder="0.0"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Base weight used for pricing. Variants can override this with their own weight.
            </p>
          </div>

          <div>
            <Label htmlFor="base-purity" className="text-sm font-medium">
              Base Purity
            </Label>
            <select
              id="base-purity"
              className="mt-1 flex h-10 w-full rounded-md border border-brand-300 bg-background px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
              value={basePurity || ""}
              onChange={(e) => onBasePurityChange(e.target.value || undefined)}
              required
            >
              <option value="">Select purity</option>
              {purityOptions.map((purity) => (
                <option key={purity} value={purity}>
                  {purity}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-1">
              Base purity used for pricing calculations.
            </p>
          </div>

          {pricingModel === "hybrid" && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
              <p className="text-sm text-amber-800">
                <strong>Hybrid Pricing:</strong> The base metal price will be calculated automatically.
                You can set an additional price for each variant when creating variants.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
