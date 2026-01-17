import type { Product, ProductCategory } from "@/types/products";

// Mock product data (in production, this would be in a database)
// Note: This file is kept for backward compatibility with some routes
// Most routes now use lib/db/products.ts which connects to Supabase
let mockProducts: Product[] = [
  {
    id: "1",
    name: "916 Gold Ring - Classic Design",
    category: "ring",
    description: "Beautiful 916 gold ring with classic design, perfect for everyday wear.",
    images: ["/placeholder-jewelry.jpg"],
    price: 1200,
    weight: 5.2,
    purity: "916",
    metalType: "gold",
    size: "7",
    designStyle: "Classic",
    finish: "Polished",
    pricingModel: "fixed",
    hasVariants: false,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "999.9 Gold Bar - 1 oz",
    category: "gold_bar",
    description: "Pure 999.9 gold bar, 1 troy ounce. Investment grade.",
    images: ["/placeholder-bar.jpg"],
    price: 8500,
    weight: 31.1,
    purity: "999.9",
    metalType: "gold",
    dimensions: "50mm x 30mm x 2mm",
    pricingModel: "fixed",
    hasVariants: false,
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    name: "916 Gold Coin - Limited Edition",
    category: "gold_coin",
    description: "Limited edition 916 gold coin with commemorative design.",
    images: ["/placeholder-coin.jpg"],
    price: 2500,
    weight: 7.5,
    purity: "916",
    metalType: "gold",
    designStyle: "Commemorative",
    dimensions: "22mm diameter",
    pricingModel: "fixed",
    hasVariants: false,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "4",
    name: "916 Gold Necklace - Elegant",
    category: "necklace",
    description: "Elegant 916 gold necklace with intricate design.",
    images: ["/placeholder-jewelry.jpg"],
    price: 3500,
    weight: 12.8,
    purity: "916",
    metalType: "gold",
    size: "18 inches",
    designStyle: "Elegant",
    finish: "Polished",
    pricingModel: "fixed",
    hasVariants: false,
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "5",
    name: "999.9 Gold Bar - 10g",
    category: "gold_bar",
    description: "Pure 999.9 gold bar, 10 grams. Perfect for small investments.",
    images: ["/placeholder-bar.jpg"],
    price: 2800,
    weight: 10,
    purity: "999.9",
    metalType: "gold",
    dimensions: "30mm x 20mm x 1.5mm",
    pricingModel: "fixed",
    hasVariants: false,
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
  },
  {
    id: "6",
    name: "916 Gold Bangle - Traditional",
    category: "bangle",
    description: "Traditional 916 gold bangle with intricate patterns.",
    images: ["/placeholder-jewelry.jpg"],
    price: 2800,
    weight: 15.5,
    purity: "916",
    metalType: "gold",
    size: "2.5 inches",
    designStyle: "Traditional",
    finish: "Polished",
    pricingModel: "fixed",
    hasVariants: false,
    createdAt: new Date("2024-01-14"),
    updatedAt: new Date("2024-01-14"),
  },
  {
    id: "7",
    name: "925 Silver Coin - Bullion",
    category: "silver_coin",
    description: "Pure 925 silver bullion coin, 1 troy ounce.",
    images: ["/placeholder-coin.jpg"],
    price: 150,
    weight: 31.1,
    purity: "925",
    metalType: "silver",
    designStyle: "Bullion",
    dimensions: "40mm diameter",
    pricingModel: "fixed",
    hasVariants: false,
    createdAt: new Date("2024-01-16"),
    updatedAt: new Date("2024-01-16"),
  },
];

/**
 * Gets all products
 */
export function getAllProducts(): Product[] {
  return mockProducts;
}

/**
 * Gets products by category
 */
export function getProductsByCategory(category: ProductCategory): Product[] {
  return mockProducts.filter((p) => p.category === category);
}

/**
 * Gets a product by ID
 */
export function getProductById(id: string): Product | undefined {
  return mockProducts.find((p) => p.id === id);
}

/**
 * Creates a new product (staff only)
 */
export function createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt">): Product {
  const newProduct: Product = {
    ...product,
    id: `product_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockProducts.push(newProduct);
  return newProduct;
}

/**
 * Updates a product (staff only)
 */
export function updateProduct(id: string, updates: Partial<Product>): Product | null {
  const index = mockProducts.findIndex((p) => p.id === id);
  if (index === -1) {
    return null;
  }
  mockProducts[index] = {
    ...mockProducts[index],
    ...updates,
    updatedAt: new Date(),
  };
  return mockProducts[index];
}

/**
 * Deletes a product (staff only)
 */
export function deleteProduct(id: string): boolean {
  const index = mockProducts.findIndex((p) => p.id === id);
  if (index === -1) {
    return false;
  }
  mockProducts.splice(index, 1);
  return true;
}

