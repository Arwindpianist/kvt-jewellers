import type { ProductCategory, MetalType } from "@/lib/product-categories";

export type { ProductCategory, MetalType };

export type PricingModel = 'fixed' | 'dynamic' | 'hybrid';

export interface ProductVariant {
  id: string;
  productId: string;
  size?: string;
  finish?: string;
  metalType?: MetalType;
  designStyle?: string;
  stoneType?: string;
  weight?: number; // Variant-specific weight
  additionalPrice: number; // For hybrid pricing
  basePrice?: number; // For fixed pricing
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  images: string[];
  price?: number;
  weight?: number;
  purity?: string;
  metalType?: MetalType;
  size?: string;
  dimensions?: string;
  stoneType?: string;
  stoneCount?: number;
  designStyle?: string;
  finish?: string;
  pricingModel: PricingModel;
  baseWeight?: number;
  basePurity?: string;
  hasVariants: boolean;
  variants?: ProductVariant[]; // Populated when needed
  createdAt: Date;
  updatedAt: Date;
}

