"use client";

import type { Product } from "@/types/products";

const WISHLIST_STORAGE_KEY = "kvt-wishlist";

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

/**
 * Get wishlist from localStorage
 */
export function getWishlist(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const items: WishlistItem[] = JSON.parse(stored);
    return items.map((item) => item.productId);
  } catch {
    return [];
  }
}

/**
 * Get full wishlist items
 */
export function getWishlistItems(): WishlistItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

/**
 * Save wishlist to localStorage
 */
export function saveWishlist(items: WishlistItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
  
  // Dispatch custom event for wishlist updates
  window.dispatchEvent(new CustomEvent("wishlistUpdated"));
}

/**
 * Sync wishlist with database (if user is logged in)
 */
async function syncWishlistWithDB(productId: string, action: "add" | "remove"): Promise<void> {
  try {
    // Check if user is logged in
    const response = await fetch("/api/auth/customer/me");
    if (!response.ok) {
      // User not logged in, skip DB sync
      return;
    }

    const data = await response.json();
    if (!data.user) {
      // User not logged in, skip DB sync
      return;
    }

    // Sync with database
    if (action === "add") {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
    } else {
      await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
      });
    }
  } catch (error) {
    console.error("Error syncing wishlist with DB:", error);
    // Continue with localStorage even if DB sync fails
  }
}

/**
 * Add product to wishlist
 */
export function addToWishlist(productId: string): void {
  const items = getWishlistItems();
  
  // Check if already in wishlist
  if (items.some((item) => item.productId === productId)) {
    return;
  }

  items.push({
    productId,
    addedAt: new Date().toISOString(),
  });

  saveWishlist(items);
  
  // Sync with database if user is logged in
  syncWishlistWithDB(productId, "add");
}

/**
 * Remove product from wishlist
 */
export function removeFromWishlist(productId: string): void {
  const items = getWishlistItems();
  const filtered = items.filter((item) => item.productId !== productId);
  saveWishlist(filtered);
  
  // Sync with database if user is logged in
  syncWishlistWithDB(productId, "remove");
}

/**
 * Check if product is in wishlist
 */
export function isInWishlist(productId: string): boolean {
  return getWishlist().includes(productId);
}

/**
 * Toggle product in wishlist
 */
export function toggleWishlist(productId: string): boolean {
  if (isInWishlist(productId)) {
    removeFromWishlist(productId);
    return false;
  } else {
    addToWishlist(productId);
    return true;
  }
}

/**
 * Get wishlist count
 */
export function getWishlistCount(): number {
  return getWishlist().length;
}

/**
 * Load wishlist from database and merge with localStorage
 */
export async function loadWishlistFromDB(): Promise<void> {
  try {
    const response = await fetch("/api/auth/customer/me");
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    if (!data.user) {
      return;
    }

    // Fetch wishlist from database
    const wishlistResponse = await fetch("/api/wishlist");
    if (wishlistResponse.ok) {
      const dbWishlist = await wishlistResponse.json();
      const dbItems: WishlistItem[] = (dbWishlist.items || []).map((item: any) => ({
        productId: item.product_id,
        addedAt: item.created_at,
      }));

      // Merge with localStorage (DB takes precedence)
      const localItems = getWishlistItems();
      const mergedItems = [...dbItems];
      
      // Add local items that aren't in DB
      localItems.forEach((localItem) => {
        if (!dbItems.some((dbItem) => dbItem.productId === localItem.productId)) {
          mergedItems.push(localItem);
        }
      });

      saveWishlist(mergedItems);
    }
  } catch (error) {
    console.error("Error loading wishlist from DB:", error);
  }
}
