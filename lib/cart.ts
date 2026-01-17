"use client";

import type { CartItem, Cart } from "@/types/cart";

const CART_STORAGE_KEY = "kvt-cart";

/**
 * Get cart from localStorage
 */
export function getCart(): Cart {
  if (typeof window === "undefined") {
    return { items: [], total: 0 };
  }

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) {
      return { items: [], total: 0 };
    }
    return JSON.parse(stored);
  } catch {
    return { items: [], total: 0 };
  }
}

/**
 * Save cart to localStorage
 */
export function saveCart(cart: Cart): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Failed to save cart:", error);
  }
}

/**
 * Calculate cart total
 */
function calculateTotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

/**
 * Add item to cart
 */
export function addToCart(item: Omit<CartItem, "quantity">, quantity: number = 1): Cart {
  const cart = getCart();
  // For products with variants, treat items with different variants as separate items
  const existingIndex = cart.items.findIndex((i) => 
    i.productId === item.productId && 
    i.variantId === item.variantId
  );

  if (existingIndex >= 0) {
    // Update quantity
    cart.items[existingIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({ ...item, quantity });
  }

  cart.total = calculateTotal(cart.items);
  saveCart(cart);
  return cart;
}

/**
 * Update item quantity in cart
 */
export function updateCartItemQuantity(productId: string, quantity: number, variantId?: string): Cart {
  const cart = getCart();
  const itemIndex = cart.items.findIndex((i) => 
    i.productId === productId && 
    i.variantId === variantId
  );

  if (itemIndex >= 0) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
    cart.total = calculateTotal(cart.items);
    saveCart(cart);
  }

  return cart;
}

/**
 * Remove item from cart
 */
export function removeFromCart(productId: string, variantId?: string): Cart {
  const cart = getCart();
  cart.items = cart.items.filter((i) => 
    i.productId !== productId || i.variantId !== variantId
  );
  cart.total = calculateTotal(cart.items);
  saveCart(cart);
  return cart;
}

/**
 * Clear cart
 */
export function clearCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_STORAGE_KEY);
}

/**
 * Get cart item count
 */
export function getCartItemCount(): number {
  const cart = getCart();
  return cart.items.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Dispatch a custom event to notify components that the cart has been updated
 * This allows components like CartButton to refresh their display
 */
export function dispatchCartUpdate(): void {
  if (typeof window === "undefined") return;
  
  // Dispatch a custom event that other components can listen to
  window.dispatchEvent(new CustomEvent("cartUpdated", { detail: getCart() }));
}