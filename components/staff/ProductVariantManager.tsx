"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedButton } from "@/components/public/AnimatedButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { logger } from "@/lib/logger";
import type { ProductVariant, Product, MetalType } from "@/types/products";
import {
  metalTypes,
  purityOptions,
  designStyles,
  finishOptions,
  stoneTypes,
} from "@/lib/product-categories";

interface ProductVariantManagerProps {
  productId: string;
  product: Product;
  onVariantsChange?: () => void;
}

export function ProductVariantManager({
  productId,
  product,
  onVariantsChange,
}: ProductVariantManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; variantId: string | null }>({
    open: false,
    variantId: null,
  });
  const [formData, setFormData] = useState({
    size: "",
    finish: "",
    metalType: "" as MetalType | "",
    designStyle: "",
    stoneType: "",
    weight: "",
    additionalPrice: "",
    basePrice: "",
    active: true,
  });

  // Fetch variants
  const fetchVariants = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/products/${productId}/variants`);
      if (!response.ok) {
        throw new Error("Failed to fetch variants");
      }
      const data = await response.json();
      setVariants(data.variants || []);
    } catch (error) {
      logger.error("Error fetching variants", error);
      setError("Failed to load variants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const handleOpenDialog = (variant?: ProductVariant) => {
    if (variant) {
      setEditingVariant(variant);
      setFormData({
        size: variant.size || "",
        finish: variant.finish || "",
        metalType: variant.metalType || "",
        designStyle: variant.designStyle || "",
        stoneType: variant.stoneType || "",
        weight: variant.weight?.toString() || "",
        additionalPrice: variant.additionalPrice?.toString() || "0",
        basePrice: variant.basePrice?.toString() || "",
        active: variant.active,
      });
    } else {
      setEditingVariant(null);
      setFormData({
        size: "",
        finish: "",
        metalType: "",
        designStyle: "",
        stoneType: "",
        weight: "",
        additionalPrice: "0",
        basePrice: "",
        active: true,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const variantData = {
        size: formData.size || undefined,
        finish: formData.finish || undefined,
        metalType: formData.metalType || undefined,
        designStyle: formData.designStyle || undefined,
        stoneType: formData.stoneType || undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        additionalPrice: formData.additionalPrice ? parseFloat(formData.additionalPrice) : 0,
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : undefined,
        active: formData.active,
      };

      const response = editingVariant
        ? await fetch(`/api/products/${productId}/variants/${editingVariant.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(variantData),
          })
        : await fetch(`/api/products/${productId}/variants`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(variantData),
          });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save variant");
      }

      setSuccess(editingVariant ? "Variant updated successfully" : "Variant created successfully");
      setTimeout(() => setSuccess(""), 5000);
      setEditingVariant(null);
      fetchVariants();
      if (onVariantsChange) onVariantsChange();
    } catch (error) {
      logger.error("Error saving variant", error);
      setError(error instanceof Error ? error.message : "Failed to save variant");
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.variantId) return;

    try {
      const response = await fetch(`/api/products/${productId}/variants/${deleteDialog.variantId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete variant");
      }

      setSuccess("Variant deleted successfully");
      setTimeout(() => setSuccess(""), 5000);
      setDeleteDialog({ open: false, variantId: null });
      fetchVariants();
      if (onVariantsChange) onVariantsChange();
    } catch (error) {
      logger.error("Error deleting variant", error);
      setError("Failed to delete variant");
      setDeleteDialog({ open: false, variantId: null });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Product Variants</h3>
          <p className="text-sm text-muted-foreground">
            {variants.length} variant{variants.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <AnimatedButton
          onClick={() => handleOpenDialog()}
          className="gold-gradient-button rounded-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Variant
        </AnimatedButton>
      </div>

      {variants.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No variants configured yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add variants to offer different sizes, finishes, or other options.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Options</TableHead>
                    <TableHead>Weight (g)</TableHead>
                    {product.pricingModel === "hybrid" && (
                      <TableHead>Additional Price</TableHead>
                    )}
                    {product.pricingModel === "fixed" && (
                      <TableHead>Base Price</TableHead>
                    )}
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.map((variant) => (
                    <TableRow key={variant.id}>
                      <TableCell>
                        <div className="space-y-1">
                          {variant.size && (
                            <Badge variant="outline" className="mr-1">
                              Size: {variant.size}
                            </Badge>
                          )}
                          {variant.finish && (
                            <Badge variant="outline" className="mr-1">
                              Finish: {variant.finish}
                            </Badge>
                          )}
                          {variant.metalType && (
                            <Badge variant="outline" className="mr-1">
                              Metal: {variant.metalType}
                            </Badge>
                          )}
                          {variant.designStyle && (
                            <Badge variant="outline" className="mr-1">
                              Style: {variant.designStyle}
                            </Badge>
                          )}
                          {variant.stoneType && (
                            <Badge variant="outline" className="mr-1">
                              Stone: {variant.stoneType}
                            </Badge>
                          )}
                          {!variant.size && !variant.finish && !variant.metalType && !variant.designStyle && !variant.stoneType && (
                            <span className="text-sm text-muted-foreground">Default variant</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {variant.weight ? `${variant.weight}g` : "-"}
                      </TableCell>
                      {product.pricingModel === "hybrid" && (
                        <TableCell>
                          {variant.additionalPrice > 0
                            ? `+${new Intl.NumberFormat("en-MY", {
                                style: "currency",
                                currency: "MYR",
                              }).format(variant.additionalPrice)}`
                            : "-"}
                        </TableCell>
                      )}
                      {product.pricingModel === "fixed" && (
                        <TableCell>
                          {variant.basePrice
                            ? new Intl.NumberFormat("en-MY", {
                                style: "currency",
                                currency: "MYR",
                              }).format(variant.basePrice)
                            : "-"}
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge variant={variant.active ? "default" : "secondary"}>
                          {variant.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(variant)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteDialog({ open: true, variantId: variant.id })}
                            className="!bg-red-600 hover:!bg-red-700 !text-white border-red-600"
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Variant Dialog */}
      <Dialog open={editingVariant !== null || false} onOpenChange={(open) => !open && setEditingVariant(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingVariant ? "Edit Variant" : "Add Variant"}</DialogTitle>
            <DialogDescription>
              Configure variant options and pricing. Leave fields empty for default values.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="variant-size">Size</Label>
                <Input
                  id="variant-size"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div>
                <Label htmlFor="variant-finish">Finish</Label>
                <select
                  id="variant-finish"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.finish}
                  onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                >
                  <option value="">None</option>
                  {finishOptions.map((finish) => (
                    <option key={finish} value={finish}>
                      {finish}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="variant-metal-type">Metal Type</Label>
                <select
                  id="variant-metal-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.metalType}
                  onChange={(e) => setFormData({ ...formData, metalType: e.target.value as MetalType | "" })}
                >
                  <option value="">None</option>
                  {metalTypes.map((mt) => (
                    <option key={mt.value} value={mt.value}>
                      {mt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="variant-design-style">Design Style</Label>
                <select
                  id="variant-design-style"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.designStyle}
                  onChange={(e) => setFormData({ ...formData, designStyle: e.target.value })}
                >
                  <option value="">None</option>
                  {designStyles.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="variant-stone-type">Stone Type</Label>
                <select
                  id="variant-stone-type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.stoneType}
                  onChange={(e) => setFormData({ ...formData, stoneType: e.target.value })}
                >
                  <option value="">None</option>
                  {stoneTypes.map((stone) => (
                    <option key={stone} value={stone}>
                      {stone}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="variant-weight">Weight (g)</Label>
                <Input
                  id="variant-weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="Optional"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Overrides product base weight
                </p>
              </div>
            </div>

            {product.pricingModel === "hybrid" && (
              <div>
                <Label htmlFor="variant-additional-price">Additional Price (MYR)</Label>
                <Input
                  id="variant-additional-price"
                  type="number"
                  step="0.01"
                  value={formData.additionalPrice}
                  onChange={(e) => setFormData({ ...formData, additionalPrice: e.target.value })}
                  placeholder="0.00"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Additional price added on top of calculated metal price
                </p>
              </div>
            )}

            {product.pricingModel === "fixed" && (
              <div>
                <Label htmlFor="variant-base-price">Base Price (MYR)</Label>
                <Input
                  id="variant-base-price"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Fixed price for this variant (overrides product base price)
                </p>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="variant-active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="variant-active" className="font-normal">
                Active (visible to customers)
              </Label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingVariant(null)}
              >
                Cancel
              </Button>
              <AnimatedButton type="submit" className="gold-gradient-button">
                {editingVariant ? "Update Variant" : "Create Variant"}
              </AnimatedButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, variantId: null })}
        title="Delete Variant"
        description="Are you sure you want to delete this variant? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
}
