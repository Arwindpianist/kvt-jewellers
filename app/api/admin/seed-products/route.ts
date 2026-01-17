import { NextRequest, NextResponse } from "next/server";
import { verifyStaffAuth } from "@/lib/auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import type { ProductCategory } from "@/lib/product-categories";

type DatabaseCategory = "coin" | "bar" | "jewellery";

/**
 * Map ProductCategory to database enum category
 */
function mapCategoryToDatabase(category: ProductCategory): DatabaseCategory {
  // Investment products
  if (category === "gold_bar" || category === "silver_bar") {
    return "bar";
  }
  if (category === "gold_coin" || category === "silver_coin") {
    return "coin";
  }
  // All other categories are jewelry
  return "jewellery";
}

interface SampleProduct {
  name: string;
  category: ProductCategory;
  description: string;
  imageUrl: string;
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
  {
    name: "999.9 Pure Gold Bar - 500g",
    category: "gold_bar",
    description: "Large 999.9 pure gold bar, 500 grams. Premium investment piece.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=800&fit=crop",
    price: 140000,
    weight: 500,
    purity: "999.9",
    metalType: "gold",
    dimensions: "75mm x 40mm x 15mm",
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
  {
    name: "999 Pure Silver Bar - 100g",
    category: "silver_bar",
    description: "Small 999 pure silver bar, 100 grams. Great starter investment.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=800&fit=crop",
    price: 450,
    weight: 100,
    purity: "999",
    metalType: "silver",
    dimensions: "50mm x 25mm x 8mm",
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
  {
    name: "999.9 Gold Coin - 1/2 oz",
    category: "gold_coin",
    description: "Pure 999.9 gold coin, half troy ounce. Premium bullion coin.",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop",
    price: 4250,
    weight: 15.55,
    purity: "999.9",
    metalType: "gold",
    designStyle: "Bullion",
    dimensions: "27mm diameter",
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
  {
    name: "999 Silver Coin - Pure",
    category: "silver_coin",
    description: "Pure 999 silver coin, 1 troy ounce. Investment-grade.",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop",
    price: 180,
    weight: 31.1,
    purity: "999",
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
  {
    name: "916 Gold Necklace - Traditional Heavy",
    category: "necklace",
    description: "Heavy traditional 916 gold necklace with ornate design.",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
    price: 12000,
    weight: 35.5,
    purity: "916",
    metalType: "gold",
    size: "16 inches",
    designStyle: "Traditional",
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
  {
    name: "916 Gold Chain - Box Style",
    category: "chain",
    description: "Modern 916 gold box chain with square links.",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
    price: 2800,
    weight: 10.5,
    purity: "916",
    metalType: "gold",
    size: "24 inches",
    designStyle: "Modern",
    finish: "High Polish",
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
  {
    name: "916 Gold Pendant - Diamond",
    category: "pendant",
    description: "Elegant 916 gold pendant with center diamond.",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
    price: 5500,
    weight: 4.2,
    purity: "916",
    metalType: "gold",
    dimensions: "20mm x 15mm",
    stoneType: "Diamond",
    stoneCount: 1,
    designStyle: "Elegant",
    finish: "Polished",
  },
  // Jewelry - Chokers
  {
    name: "916 Gold Choker - Delicate",
    category: "choker",
    description: "Delicate 916 gold choker with fine chain design.",
    imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
    price: 2500,
    weight: 6.5,
    purity: "916",
    metalType: "gold",
    size: "16 inches",
    designStyle: "Delicate",
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
  {
    name: "916 Gold Bangle - Heavy Ornate",
    category: "bangle",
    description: "Heavy ornate 916 gold bangle with elaborate traditional patterns.",
    imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop",
    price: 12000,
    weight: 55.0,
    purity: "916",
    metalType: "gold",
    size: "3 inches",
    dimensions: "3 inches diameter",
    designStyle: "Ornate",
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
    name: "916 Gold Bracelet - Cuff Style",
    category: "bracelet",
    description: "Modern 916 gold cuff bracelet with contemporary design.",
    imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop",
    price: 3800,
    weight: 14.5,
    purity: "916",
    metalType: "gold",
    size: "7.5 inches",
    designStyle: "Modern",
    finish: "High Polish",
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
    name: "916 Gold Ring - Signet",
    category: "ring",
    description: "Classic 916 gold signet ring with engraved design.",
    imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop",
    price: 2200,
    weight: 8.5,
    purity: "916",
    metalType: "gold",
    size: "9",
    designStyle: "Classic",
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
    name: "916 Gold Engagement Ring - Ruby",
    category: "engagement_ring",
    description: "Beautiful 916 gold engagement ring with center ruby.",
    imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop",
    price: 9500,
    weight: 5.2,
    purity: "916",
    metalType: "gold",
    size: "7",
    stoneType: "Ruby",
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
  {
    name: "916 Gold Wedding Ring - Modern",
    category: "wedding_ring",
    description: "Modern 916 gold wedding ring with contemporary design.",
    imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop",
    price: 1800,
    weight: 5.0,
    purity: "916",
    metalType: "gold",
    size: "8",
    designStyle: "Modern",
    finish: "High Polish",
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
    name: "916 Gold Stud Earrings - Pearl",
    category: "stud_earring",
    description: "Classic 916 gold stud earrings with natural pearls.",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop",
    price: 2800,
    weight: 2.8,
    purity: "916",
    metalType: "gold",
    dimensions: "8mm diameter",
    stoneType: "Pearl",
    stoneCount: 2,
    designStyle: "Classic",
    finish: "Polished",
  },
  {
    name: "916 Gold Hoop Earrings - Small",
    category: "hoop_earring",
    description: "Classic 916 gold hoop earrings, small size.",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop",
    price: 1800,
    weight: 4.5,
    purity: "916",
    metalType: "gold",
    size: "20mm",
    designStyle: "Classic",
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
    name: "916 Gold Hoop Earrings - Large",
    category: "hoop_earring",
    description: "Bold 916 gold hoop earrings, large size.",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop",
    price: 3200,
    weight: 10.5,
    purity: "916",
    metalType: "gold",
    size: "40mm",
    designStyle: "Modern",
    finish: "High Polish",
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
  {
    name: "916 Gold Drop Earrings - Chandelier",
    category: "drop_earring",
    description: "Dramatic 916 gold chandelier earrings with multiple tiers.",
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop",
    price: 6500,
    weight: 12.5,
    purity: "916",
    metalType: "gold",
    size: "60mm",
    dimensions: "60mm length",
    designStyle: "Ornate",
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
  {
    name: "916 Gold Toe Ring - Traditional",
    category: "toe_ring",
    description: "Traditional 916 gold toe ring with simple design.",
    imageUrl: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&h=800&fit=crop",
    price: 800,
    weight: 1.5,
    purity: "916",
    metalType: "gold",
    size: "6",
    designStyle: "Traditional",
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
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Seed products with images
 * POST /api/admin/seed-products
 */
export async function POST(request: NextRequest) {
  try {
    const session = await verifyStaffAuth(request);

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const supabase = createServiceRoleClient();
    const results: Array<{ name: string; success: boolean; error?: string }> = [];

    for (const product of sampleProducts) {
      try {
        // Download and upload image
        const imageBuffer = await downloadImage(product.imageUrl);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;
        const imageUrl = await uploadImageToStorage(imageBuffer, fileName, "image/jpeg");

        // Check if product already exists
        const { data: existing } = await supabase
          .from("products")
          .select("id")
          .eq("name", product.name)
          .single();

        if (existing) {
          // Update existing product
          const { error } = await supabase
            .from("products")
            .update({
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
            .eq("id", existing.id);

          if (error) {
            results.push({ name: product.name, success: false, error: error.message });
          } else {
            results.push({ name: product.name, success: true });
          }
        } else {
          // Create new product
          const { error } = await supabase
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
            });

          if (error) {
            results.push({ name: product.name, success: false, error: error.message });
          } else {
            results.push({ name: product.name, success: true });
          }
        }
      } catch (error) {
        results.push({
          name: product.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `Seeded ${successCount} products successfully. ${failCount} failed.`,
      results,
      successCount,
      failCount,
    });
  } catch (error) {
    console.error("Error in seed-products API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
