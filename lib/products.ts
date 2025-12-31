import type { Product, ProductCategory } from "@/types/products";

// Mock product data (in production, this would be in a database)
let mockProducts: Product[] = [
  {
    id: "1",
    name: "916 Gold Ring - Classic Design",
    category: "jewellery",
    description: "Beautiful 916 gold ring with classic design, perfect for everyday wear.",
    images: ["/placeholder-jewelry.jpg"],
    price: 1200,
    weight: 5.2,
    purity: "916",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "999.9 Gold Bar - 1 oz",
    category: "bar",
    description: "Pure 999.9 gold bar, 1 troy ounce. Investment grade.",
    images: ["/placeholder-bar.jpg"],
    price: 8500,
    weight: 31.1,
    purity: "999.9",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    name: "916 Gold Coin - Limited Edition",
    category: "coin",
    description: "Limited edition 916 gold coin with commemorative design.",
    images: ["/placeholder-coin.jpg"],
    price: 2500,
    weight: 7.5,
    purity: "916",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "4",
    name: "916 Gold Necklace - Elegant",
    category: "jewellery",
    description: "Elegant 916 gold necklace with intricate design.",
    images: ["/placeholder-jewelry.jpg"],
    price: 3500,
    weight: 12.8,
    purity: "916",
    createdAt: new Date("2024-01-18"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "5",
    name: "999.9 Gold Bar - 10g",
    category: "bar",
    description: "Pure 999.9 gold bar, 10 grams. Perfect for small investments.",
    images: ["/placeholder-bar.jpg"],
    price: 2800,
    weight: 10,
    purity: "999.9",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12"),
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

