"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedButton } from "@/components/public/AnimatedButton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { logger } from "@/lib/logger";
import type { Product, ProductCategory, PricingModel } from "@/types/products";
import { ImageCarousel } from "./ImageCarousel";
import { ImageCropper } from "./ImageCropper";
import { PricingModelSelector } from "./PricingModelSelector";
import { ProductVariantManager } from "./ProductVariantManager";
import {
  categoryConfig,
  categoryGroups,
  metalTypes,
  purityOptions,
  designStyles,
  finishOptions,
  stoneTypes,
  type MetalType,
} from "@/lib/product-categories";

interface ProductFormProps {
  product?: Product | null;
  onSuccess?: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [croppingImage, setCroppingImage] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [formData, setFormData] = useState({
    name: product?.name || "",
    category: (product?.category || "necklace") as ProductCategory,
    description: product?.description || "",
    price: product?.price?.toString() || "",
    weight: product?.weight?.toString() || "",
    purity: product?.purity || "",
    metalType: (product?.metalType || "") as MetalType | "",
    size: product?.size || "",
    dimensions: product?.dimensions || "",
    stoneType: product?.stoneType || "",
    stoneCount: product?.stoneCount?.toString() || "",
    designStyle: product?.designStyle || "",
    finish: product?.finish || "",
    images: product?.images || [],
    pricingModel: (product?.pricingModel || "fixed") as PricingModel,
    baseWeight: product?.baseWeight?.toString() || "",
    basePurity: product?.basePurity || "",
    hasVariants: product?.hasVariants || false,
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Only JPEG, PNG, WebP, and AVIF are allowed.");
        return;
      }
      if (file.size > maxSize) {
        setError("File size exceeds 5MB limit");
        return;
      }
    }

    setError("");
    if (files.length > 0) {
      setCroppingImage(files[0]);
      setShowCropper(true);
    }
    e.target.value = "";
  };

  const handleCropComplete = async (croppedImageUrl: string) => {
    try {
      setUploadingImage(true);
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      const file = new File([blob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" });

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const uploadResponse = await fetch("/api/admin/upload-image", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const uploadData = await uploadResponse.json();
      setFormData({
        ...formData,
        images: [...formData.images, uploadData.url],
      });

      URL.revokeObjectURL(croppedImageUrl);
      setUploadingImage(false);
      setShowCropper(false);
      setCroppingImage(null);
    } catch (error) {
      logger.error("Error uploading cropped image", error);
      setError(error instanceof Error ? error.message : "Failed to upload image");
      setUploadingImage(false);
      setShowCropper(false);
      setCroppingImage(null);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError("");

      const productData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        images: formData.images.length > 0 ? formData.images : (product?.images || []),
        price: formData.price ? parseFloat(formData.price) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        purity: formData.purity || undefined,
        metalType: formData.metalType || undefined,
        size: formData.size || undefined,
        dimensions: formData.dimensions || undefined,
        stoneType: formData.stoneType || undefined,
        stoneCount: formData.stoneCount ? parseInt(formData.stoneCount) : undefined,
        designStyle: formData.designStyle || undefined,
        finish: formData.finish || undefined,
        pricingModel: formData.pricingModel,
        baseWeight: formData.baseWeight ? parseFloat(formData.baseWeight) : undefined,
        basePurity: formData.basePurity || undefined,
        hasVariants: formData.hasVariants,
      };

      const response = product
        ? await fetch("/api/products", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: product.id, ...productData }),
          })
        : await fetch("/api/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productData),
          });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save product");
      }

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/staff/products");
        router.refresh();
      }
    } catch (error) {
      logger.error("Error saving product", error);
      setError(error instanceof Error ? error.message : "Failed to save product. Please try again.");
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/staff/products")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="font-serif text-3xl font-semibold text-brand-700">
          {product ? "Edit Product" : "New Product"}
        </h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-2 border-brand-200/50 dark:border-brand-700/50 bg-card-level-2 shadow-card-elevated">
        <CardHeader className="bg-gradient-to-br from-brand-50 to-white">
          <CardTitle className="font-serif text-xl font-semibold text-brand-700">
            {product ? "Edit Product" : "New Product"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Product Name</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 border-brand-300 focus:border-brand-500"
                placeholder="Enter product name"
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-sm font-medium">Category</Label>
              <select
                id="category"
                className="mt-1 flex h-10 w-full rounded-md border border-brand-300 bg-background px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
                value={formData.category}
                onChange={(e) => {
                  const newCategory = e.target.value as ProductCategory;
                  const config = categoryConfig[newCategory];
                  setFormData({
                    ...formData,
                    category: newCategory,
                    metalType: config.defaultMetalType || "",
                  });
                }}
                required
              >
                <optgroup label="Investment Products">
                  {categoryGroups.investment.categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryConfig[cat].label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Jewelry - Necklaces & Chains">
                  {["necklace", "chain", "pendant", "choker"].map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryConfig[cat as ProductCategory].label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Jewelry - Bangles & Bracelets">
                  {["bangle", "bracelet", "charm_bracelet"].map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryConfig[cat as ProductCategory].label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Jewelry - Rings">
                  {["ring", "engagement_ring", "wedding_ring"].map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryConfig[cat as ProductCategory].label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Jewelry - Earrings">
                  {["earring", "stud_earring", "hoop_earring", "drop_earring"].map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryConfig[cat as ProductCategory].label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Other Jewelry">
                  {["anklet", "toe_ring", "other"].map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryConfig[cat as ProductCategory].label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <textarea
                id="description"
                className="mt-1 flex min-h-[100px] w-full rounded-md border border-brand-300 bg-background px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
              />
            </div>
            {/* Image Upload */}
            <div>
              <Label className="text-sm font-medium">Product Images</Label>
              <div className="mt-2 space-y-3">
                {formData.images.length > 0 ? (
                  <ImageCarousel
                    images={formData.images}
                    onRemove={handleRemoveImage}
                    aspectRatio="square"
                    showIndicators={true}
                  />
                ) : (
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border-2 border-dashed border-brand-300 bg-brand-50 flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-12 w-12 text-brand-400" />
                      <p className="mt-2 text-sm text-brand-600">No images uploaded</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Label
                    htmlFor="image"
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-brand-300 bg-white px-4 py-2 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
                  >
                    <ImageIcon className="h-4 w-4" />
                    {formData.images.length > 0 ? "Add More Images" : "Upload Images"}
                  </Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                    onChange={handleImageChange}
                    className="hidden"
                    multiple
                  />
                  {uploadingImage && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Supported formats: JPEG, PNG, WebP, AVIF. Max size: 5MB per image. Images will be cropped to square (1:1) aspect ratio.
                </p>
              </div>
            </div>
            {/* Image Cropper */}
            {croppingImage && (
              <ImageCropper
                image={croppingImage}
                isOpen={showCropper}
                onClose={() => {
                  setShowCropper(false);
                  setCroppingImage(null);
                }}
                onCropComplete={handleCropComplete}
                aspectRatio={1}
                minZoom={1}
                maxZoom={3}
              />
            )}

            {/* Pricing Model Selector */}
            <div className="border-t pt-6">
              <PricingModelSelector
                pricingModel={formData.pricingModel}
                onPricingModelChange={(model) => setFormData({ ...formData, pricingModel: model })}
                baseWeight={formData.baseWeight ? parseFloat(formData.baseWeight) : undefined}
                onBaseWeightChange={(weight) => setFormData({ ...formData, baseWeight: weight?.toString() || "" })}
                basePurity={formData.basePurity}
                onBasePurityChange={(purity) => setFormData({ ...formData, basePurity: purity || "" })}
                basePrice={formData.price ? parseFloat(formData.price) : undefined}
                onBasePriceChange={(price) => setFormData({ ...formData, price: price?.toString() || "" })}
                purityOptions={purityOptions}
              />
            </div>

            {/* Variants Toggle */}
            <div className="border-t pt-6">
              <div className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  id="has-variants"
                  checked={formData.hasVariants}
                  onChange={(e) => setFormData({ ...formData, hasVariants: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="has-variants" className="font-medium cursor-pointer">
                  Enable Product Variants
                </Label>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Enable variants to offer multiple options (sizes, finishes, etc.) for this product.
              </p>
              {formData.hasVariants && product && (
                <ProductVariantManager
                  productId={product.id}
                  product={{
                    ...product,
                    pricingModel: formData.pricingModel,
                    baseWeight: formData.baseWeight ? parseFloat(formData.baseWeight) : undefined,
                    basePurity: formData.basePurity,
                    hasVariants: formData.hasVariants,
                  }}
                />
              )}
              {formData.hasVariants && !product && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                  <p className="text-sm text-amber-800">
                    Save the product first to add variants.
                  </p>
                </div>
              )}
            </div>

            {/* Dynamic Fields Based on Category */}
            {(() => {
              const config = categoryConfig[formData.category];
              return (
                <div className="space-y-4">
                  {/* Price - Only shown for fixed pricing or as fallback */}
                  {formData.pricingModel === "fixed" && (
                    <div>
                      <Label htmlFor="price" className="text-sm font-medium">Base Price (MYR)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="mt-1 border-brand-300 focus:border-brand-500"
                        placeholder="0.00"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Base price for this product. Variants can override with their own base price.
                      </p>
                    </div>
                  )}

                  {/* Metal Type - If required */}
                  {config.fields.metalType && (
                    <div>
                      <Label htmlFor="metalType" className="text-sm font-medium">Metal Type</Label>
                      <select
                        id="metalType"
                        className="mt-1 flex h-10 w-full rounded-md border border-brand-300 bg-background px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
                        value={formData.metalType}
                        onChange={(e) => setFormData({ ...formData, metalType: e.target.value as MetalType })}
                        required
                      >
                        <option value="">Select metal type</option>
                        {metalTypes.map((mt) => (
                          <option key={mt.value} value={mt.value}>
                            {mt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Weight - If required */}
                  {config.fields.weight && (
                    <div>
                      <Label htmlFor="weight" className="text-sm font-medium">Weight (g)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        className="mt-1 border-brand-300 focus:border-brand-500"
                        placeholder="0.0"
                      />
                    </div>
                  )}

                  {/* Purity - If required */}
                  {config.fields.purity && (
                    <div>
                      <Label htmlFor="purity" className="text-sm font-medium">Purity</Label>
                      <select
                        id="purity"
                        className="mt-1 flex h-10 w-full rounded-md border border-brand-300 bg-background px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
                        value={formData.purity}
                        onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                      >
                        <option value="">Select purity</option>
                        {purityOptions.map((purity) => (
                          <option key={purity} value={purity}>
                            {purity}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Size - If required */}
                  {config.fields.size && (
                    <div>
                      <Label htmlFor="size" className="text-sm font-medium">
                        {config.sizeLabel || "Size"}
                      </Label>
                      {config.sizeOptions ? (
                        <select
                          id="size"
                          className="mt-1 flex h-10 w-full rounded-md border border-brand-300 bg-background px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
                          value={formData.size}
                          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        >
                          <option value="">Select size</option>
                          {config.sizeOptions.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          id="size"
                          value={formData.size}
                          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                          className="mt-1 border-brand-300 focus:border-brand-500"
                          placeholder="Enter size"
                        />
                      )}
                    </div>
                  )}

                  {/* Dimensions - If required */}
                  {config.fields.dimensions && (
                    <div>
                      <Label htmlFor="dimensions" className="text-sm font-medium">Dimensions</Label>
                      <Input
                        id="dimensions"
                        value={formData.dimensions}
                        onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                        className="mt-1 border-brand-300 focus:border-brand-500"
                        placeholder="e.g., 50mm x 30mm x 10mm"
                      />
                    </div>
                  )}

                  {/* Stone Type - If required */}
                  {config.fields.stoneType && (
                    <div>
                      <Label htmlFor="stoneType" className="text-sm font-medium">Stone Type</Label>
                      <select
                        id="stoneType"
                        className="mt-1 flex h-10 w-full rounded-md border border-brand-300 bg-background px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
                        value={formData.stoneType}
                        onChange={(e) => setFormData({ ...formData, stoneType: e.target.value })}
                      >
                        <option value="">Select stone type</option>
                        {stoneTypes.map((stone) => (
                          <option key={stone} value={stone}>
                            {stone}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Stone Count - If required */}
                  {config.fields.stoneCount && (
                    <div>
                      <Label htmlFor="stoneCount" className="text-sm font-medium">Number of Stones</Label>
                      <Input
                        id="stoneCount"
                        type="number"
                        min="0"
                        value={formData.stoneCount}
                        onChange={(e) => setFormData({ ...formData, stoneCount: e.target.value })}
                        className="mt-1 border-brand-300 focus:border-brand-500"
                        placeholder="0"
                      />
                    </div>
                  )}

                  {/* Design Style - If required */}
                  {config.fields.designStyle && (
                    <div>
                      <Label htmlFor="designStyle" className="text-sm font-medium">Design Style</Label>
                      <select
                        id="designStyle"
                        className="mt-1 flex h-10 w-full rounded-md border border-brand-300 bg-background px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
                        value={formData.designStyle}
                        onChange={(e) => setFormData({ ...formData, designStyle: e.target.value })}
                      >
                        <option value="">Select design style</option>
                        {designStyles.map((style) => (
                          <option key={style} value={style}>
                            {style}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Finish - If required */}
                  {config.fields.finish && (
                    <div>
                      <Label htmlFor="finish" className="text-sm font-medium">Finish</Label>
                      <select
                        id="finish"
                        className="mt-1 flex h-10 w-full rounded-md border border-brand-300 bg-background px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500"
                        value={formData.finish}
                        onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                      >
                        <option value="">Select finish</option>
                        {finishOptions.map((finish) => (
                          <option key={finish} value={finish}>
                            {finish}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              );
            })()}
            <div className="flex gap-3 pt-4">
              <AnimatedButton
                type="submit"
                className="flex-1 gold-gradient-button rounded-lg"
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading Image...
                  </>
                ) : product ? (
                  "Update Product"
                ) : (
                  "Create Product"
                )}
              </AnimatedButton>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/staff/products")}
                className="rounded-lg"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
