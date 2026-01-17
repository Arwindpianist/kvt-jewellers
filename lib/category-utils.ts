/**
 * Utility functions for product categories
 */

import type { ProductCategory } from "@/types/products";

/**
 * Convert a ProductCategory to its URL slug
 * This is the reverse mapping of categorySlugMap in the category page
 */
export function categoryToSlug(category: ProductCategory): string {
  // Direct mappings (most categories map 1:1 with underscores replaced by hyphens)
  const directMappings: Record<ProductCategory, string> = {
    // Investment Products
    gold_bar: "gold-bar",
    silver_bar: "silver-bar",
    gold_coin: "gold-coin",
    silver_coin: "silver-coin",
    // Jewelry - Necklaces & Chains
    necklace: "necklace",
    chain: "chain",
    pendant: "pendant",
    choker: "choker",
    // Jewelry - Bangles & Bracelets
    bangle: "bangle",
    bracelet: "bracelet",
    charm_bracelet: "charm-bracelet",
    // Jewelry - Rings
    ring: "ring",
    engagement_ring: "engagement-ring",
    wedding_ring: "wedding-ring",
    // Jewelry - Earrings
    earring: "earring",
    stud_earring: "stud-earring",
    hoop_earring: "hoop-earring",
    drop_earring: "drop-earring",
    // Other Jewelry
    anklet: "anklet",
    toe_ring: "toe-ring",
    other: "other",
  };

  return directMappings[category] || category.replace(/_/g, "-");
}

/**
 * Get the category page URL for a given category
 */
export function getCategoryUrl(category: ProductCategory): string {
  return `/products/${categoryToSlug(category)}`;
}
