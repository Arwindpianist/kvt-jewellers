/**
 * Seed script to create sample products with images
 * Run with: npx tsx scripts/seed-products.ts
 */

import { createServiceRoleClient } from "../lib/supabase/server";
import type { ProductCategory } from "../lib/product-categories";

interface SampleProduct {
  name: string;
  category: ProductCategory;
  description: string;
  imageUrl: string; // Unsplash or stock image URL
  price: number;
  weight?: number;
  purity?: string;
  metalType?: "gold" | "silver" | "platinum" | "palladium";
  size?: string;
  dimensions?: string;
  stoneType?: string;
  stoneCount?: number;
  designStyle?: string;
  finish?: string;
}

// Sample products with stock images from Unsplash
const sampleProducts: SampleProduct[] = [
  // Investment Products - Gold Bars
  {
    name: "999.9 Pure Gold Bar - 1 oz",
    category: "gold_bar",
    description: "Investment-grade 999.9 pure gold bar, 1 troy ounce. Perfect for serious investors.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=800&fit=crop",
    price: 8500,
    weight: 31.1,
    purity: "999.9",
    metalType: "gold",
    dimensions: "50mm x 30mm x 2mm",
  },
  {
    name: "999.9 Pure Gold Bar - 10g",
    category: "gold_bar",
    description: "Pure 999.9 gold bar, 10 grams. Perfect for small investments.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=800&fit=crop",
    price: 2800,
    weight: 10,
    purity: "999.9",
    metalType: "gold",
    dimensions: "30mm x 20mm x 1.5mm",
  },
  {
    name: "999.9 Pure Gold Bar - 100g",
    category: "gold_bar",
    description: "Premium 999.9 pure gold bar, 100 grams. Investment-grade bullion.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=800&fit=crop",
    price: 28000,
    weight: 100,
    purity: "999.9",
    metalType: "gold",
    dimensions: "55mm x 32mm x 8mm",
  },
  // Investment Products - Silver Bars
  {
    name: "999 Pure Silver Bar - 1 kg",
    category: "silver_bar",
    description: "Investment-grade 999 pure silver bar, 1 kilogram.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=800&fit=crop",
    price: 4500,
    weight: 1000,
    purity: "999",
    metalType: "silver",
    dimensions: "80mm x 40mm x 20mm",
  },
  {
    name: "999 Pure Silver Bar - 500g",
    category: "silver_bar",
    description: "Pure 999 silver bar, 500 grams. Perfect for silver investors.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=800&fit=crop",
    price: 2250,
    weight: 500,
    purity: "999",
    metalType: "silver",
    dimensions: "70mm x 35mm x 15mm",
  },
  // Investment Products - Gold Coins
  {
    name: "916 Gold Coin - Limited Edition",
    category: "gold_coin",
    description: "Limited edition 916 gold coin with commemorative design.",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop",
    price: 2500,
    weight: 7.5,
    purity: "916",
    metalType: "gold",
    designStyle: "Commemorative",
    dimensions: "22mm diameter",
  },
  {
    name: "999.9 Gold Coin - 1 oz",
    category: "gold_coin",
    description: "Pure 999.9 gold coin, 1 troy ounce. Investment-grade bullion coin.",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop",
    price: 8500,
    weight: 31.1,
    purity: "999.9",
    metalType: "gold",
    designStyle: "Bullion",
    dimensions: "32mm diameter",
  },
  // Investment Products - Silver Coins
  {
    name: "925 Silver Coin - Bullion",
    category: "silver_coin",
    description: "Pure 925 silver bullion coin, 1 troy ounce.",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop",
    price: 150,
    weight: 31.1,
    purity: "925",
    metalType: "silver",
    designStyle: "Bullion",
    dimensions: "40mm diameter",
  },
  // Jewelry - Necklaces
  {
    name: "916 Gold Necklace - Elegant Design",
    category: "necklace",
    description: "Elegant 916 gold necklace with intricate traditional design.",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
    price: 3500,
    weight: 12.8,
    purity: "916",
    metalType: "gold",
    size: "18 inches",
    designStyle: "Traditional",
    finish: "Polished",
  },
  {
    name: "916 Gold Necklace - Modern Chain",
    category: "necklace",
    description: "Modern 916 gold chain necklace with contemporary design.",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
    price: 2800,
    weight: 10.5,
    purity: "916",
    metalType: "gold",
    size: "20 inches",
    designStyle: "Modern",
    finish: "High Polish",
  },
  {
    name: "916 Gold Necklace with Diamond Pendant",
    category: "necklace",
    description: "Beautiful 916 gold necklace featuring a diamond pendant.",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
    price: 8500,
    weight: 15.2,
    purity: "916",
    metalType: "gold",
    size: "18 inches",
    stoneType: "Diamond",
    stoneCount: 1,
    designStyle: "Elegant",
    finish: "Polished",
  },
  // Jewelry - Chains
  {
    name: "916 Gold Chain - Cable Style",
    category: "chain",
    description: "Classic 916 gold cable chain, perfect for everyday wear.",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
    price: 2200,
    weight: 8.5,
    purity: "916",
    metalType: "gold",
    size: "22 inches",
    designStyle: "Classic",
    finish: "Polished",
  },
  {
    name: "916 Gold Chain - Rope Style",
    category: "chain",
    description: "Elegant 916 gold rope chain with twisted design.",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
    price: 3200,
    weight: 12.0,
    purity: "916",
    metalType: "gold",
    size: "20 inches",
    designStyle: "Classic",
    finish: "Polished",
  },
  // Jewelry - Pendants
  {
    name: "916 Gold Pendant - Traditional Motif",
    category: "pendant",
    description: "Traditional 916 gold pendant with intricate cultural motifs.",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
    price: 1800,
    weight: 5.5,
    purity: "916",
    metalType: "gold",
    dimensions: "25mm x 20mm",
    designStyle: "Traditional",
    finish: "Polished",
  },
  // Jewelry - Bangles
  {
    name: "916 Gold Bangle - Traditional",
    category: "bangle",
    description: "Traditional 916 gold bangle with intricate patterns.",
    imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop",
    price: 2800,
    weight: 15.5,
    purity: "916",
    metalType: "gold",
    size: "2.5 inches",
    dimensions: "2.5 inches diameter",
    designStyle: "Traditional",
    finish: "Polished",
  },
  {
    name: "916 Gold Bangle - Modern Design",
    category: "bangle",
    description: "Modern 916 gold bangle with sleek contemporary design.",
    imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop",
    price: 3200,
    weight: 18.0,
    purity: "916",
    metalType: "gold",
    size: "2.75 inches",
    dimensions: "2.75 inches diameter",
    designStyle: "Modern",
    finish: "High Polish",
  },
  {
    name: "916 Gold Bangle Set - 3 Pieces",
    category: "bangle",
    description: "Set of three 916 gold bangles, perfect for stacking.",
    imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop",
    price: 7500,
    weight: 45.0,
    purity: "916",
    metalType: "gold",
    size: "2.5 inches",
    dimensions: "2.5 inches diameter each",
    designStyle: "Traditional",
    finish: "Polished",
  },
  // Jewelry - Bracelets
  {
    name: "916 Gold Bracelet - Chain Style",
    category: "bracelet",
    description: "Elegant 916 gold chain bracelet with secure clasp.",
    imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop",
    price: 2500,
    weight: 9.5,
    purity: "916",
    metalType: "gold",
    size: "7 inches",
    designStyle: "Classic",
    finish: "Polished",
  },
  {
    name: "916 Gold Charm Bracelet",
    category: "charm_bracelet",
    description: "Beautiful 916 gold charm bracelet with multiple decorative charms.",
    imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop",
    price: 4200,
    weight: 14.2,
    purity: "916",
    metalType: "gold",
    size: "7.5 inches",
    designStyle: "Ornate",
    finish: "Polished",
  },
  // Jewelry - Rings
  {
    name: "916 Gold Ring - Classic Design",
    category: "ring",
    description: "Beautiful 916 gold ring with classic design, perfect for everyday wear.",
    imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop",
    price: 1200,
    weight: 5.2,
    purity: "916",
    metalType: "gold",
    size: "7",
    designStyle: "Classic",
    finish: "Polished",
  },
  {
    name: "916 Gold Ring - Ornate Design",
    category: "ring",
    description: "Ornate 916 gold ring with intricate traditional patterns.",
    imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop",
    price: 1800,
    weight: 7.5,
    purity: "916",
    metalType: "gold",
    size: "8",
    designStyle: "Ornate",
    finish: "Polished",
  },
  {
    name: "916 Gold Engagement Ring - Diamond",
    category: "engagement_ring",
    description: "Stunning 916 gold engagement ring with center diamond.",
    imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop",
    price: 12000,
    weight: 4.8,
    purity: "916",
    metalType: "gold",
    size: "6",
    stoneType: "Diamond",
    stoneCount: 1,
    designStyle: "Elegant",
    finish: "Polished",
  },
  {
    name: "916 Gold Wedding Ring - Classic",
    category: "wedding_ring",
    description: "Classic 916 gold wedding ring, timeless and elegant.",
    imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop",
    price: 1500,
    weight: 4.5,
    purity: "916",
    metalType: "gold",
    size: "7",
    designStyle: "Classic",
    finish: "Polished",
  },
  // Jewelry - Earrings
  {
    name: "916 Gold Stud Earrings - Diamond",
    category: "stud_earring",
    description: "Elegant 916 gold stud earrings with diamond accents.",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop",
    price: 3500,
    weight: 3.2,
    purity: "916",
    metalType: "gold",
    dimensions: "6mm diameter",
    stoneType: "Diamond",
    stoneCount: 2,
    designStyle: "Elegant",
    finish: "Polished",
  },
  {
    name: "916 Gold Hoop Earrings - Medium",
    category: "hoop_earring",
    description: "Classic 916 gold hoop earrings, medium size.",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop",
    price: 2200,
    weight: 6.5,
    purity: "916",
    metalType: "gold",
    size: "25mm",
    designStyle: "Classic",
    finish: "Polished",
  },
  {
    name: "916 Gold Drop Earrings - Elegant",
    category: "drop_earring",
    description: "Elegant 916 gold drop earrings with intricate design.",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop",
    price: 4200,
    weight: 8.5,
    purity: "916",
    metalType: "gold",
    size: "40mm",
    dimensions: "40mm length",
    designStyle: "Elegant",
    finish: "Polished",
  },
  {
    name: "916 Gold Drop Earrings - Pearl",
    category: "drop_earring",
    description: "Beautiful 916 gold drop earrings with natural pearls.",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop",
    price: 3800,
    weight: 7.8,
    purity: "916",
    metalType: "gold",
    size: "35mm",
    dimensions: "35mm length",
    stoneType: "Pearl",
    stoneCount: 2,
    designStyle: "Elegant",
    finish: "Polished",
  },
  // Jewelry - Other
  {
    name: "916 Gold Anklet - Delicate",
    category: "anklet",
    description: "Delicate 916 gold anklet with chain design.",
    imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop",
    price: 1800,
    weight: 5.5,
    purity: "916",
    metalType: "gold",
    size: "9 inches",
    designStyle: "Delicate",
    finish: "Polished",
  },
];

async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadImageToStorage(buffer: Buffer, fileName: string, contentType: string): Promise<string> {
  const supabase = createServiceRoleClient();
  
  const filePath = `products/${fileName}`;
  
  const { error } = await supabase.storage
    .from("product-images")
    .upload(filePath, buffer, {
      contentType,
      upsert: true, // Allow overwriting
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(filePath);

  return publicUrl;
}

async function seedProducts() {
  console.log("Starting product seeding...");
  const supabase = createServiceRoleClient();

  for (const product of sampleProducts) {
    try {
      console.log(`Processing: ${product.name}`);

      // Download and upload image
      const imageBuffer = await downloadImage(product.imageUrl);
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;
      const imageUrl = await uploadImageToStorage(imageBuffer, fileName, "image/jpeg");

      // Create product in database
      // Map category to database enum
      const mapCategoryToDatabase = (category: ProductCategory): "coin" | "bar" | "jewellery" => {
        if (category === "gold_bar" || category === "silver_bar") return "bar";
        if (category === "gold_coin" || category === "silver_coin") return "coin";
        return "jewellery";
      };

      const { data, error } = await supabase
        .from("products")
        .insert({
          name: product.name,
          category: mapCategoryToDatabase(product.category),
          description: product.description,
          image: imageUrl,
          price: product.price,
          weight: product.weight || null,
          purity: product.purity || null,
          metal_type: product.metalType || null,
          size: product.size || null,
          dimensions: product.dimensions || null,
          stone_type: product.stoneType || null,
          stone_count: product.stoneCount || null,
          design_style: product.designStyle || null,
          finish: product.finish || null,
          active: true,
        })
        .select()
        .single();

      if (error) {
        console.error(`Error creating product ${product.name}:`, error);
      } else {
        console.log(`✓ Created: ${product.name}`);
      }
    } catch (error) {
      console.error(`Error processing ${product.name}:`, error);
    }
  }

  console.log("Product seeding completed!");
}

// Run if executed directly
if (require.main === module) {
  seedProducts()
    .then(() => {
      console.log("Done!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export { seedProducts };
