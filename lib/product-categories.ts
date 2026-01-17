/**
 * Product Category Configuration
 * Defines categories, their display names, and dynamic fields
 */

export type ProductCategory =
  // Investment Products
  | "gold_bar"
  | "silver_bar"
  | "gold_coin"
  | "silver_coin"
  // Jewelry - Necklaces & Chains
  | "necklace"
  | "chain"
  | "pendant"
  | "choker"
  // Jewelry - Bangles & Bracelets
  | "bangle"
  | "bracelet"
  | "charm_bracelet"
  // Jewelry - Rings
  | "ring"
  | "engagement_ring"
  | "wedding_ring"
  // Jewelry - Earrings
  | "earring"
  | "stud_earring"
  | "hoop_earring"
  | "drop_earring"
  // Other Jewelry
  | "anklet"
  | "toe_ring"
  | "other";

export type MetalType = "gold" | "silver" | "platinum" | "palladium";

export interface CategoryConfig {
  label: string;
  group: "investment" | "jewelry";
  fields: {
    weight: boolean;
    purity: boolean;
    metalType: boolean;
    size: boolean;
    dimensions: boolean;
    stoneType: boolean;
    stoneCount: boolean;
    designStyle: boolean;
    finish: boolean;
  };
  defaultMetalType?: MetalType;
  sizeLabel?: string;
  sizeOptions?: string[];
}

export const categoryConfig: Record<ProductCategory, CategoryConfig> = {
  // Investment Products
  gold_bar: {
    label: "Gold Bar",
    group: "investment",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: false,
      dimensions: true,
      stoneType: false,
      stoneCount: false,
      designStyle: false,
      finish: false,
    },
    defaultMetalType: "gold",
    sizeLabel: "Bar Size",
    sizeOptions: ["1g", "5g", "10g", "20g", "50g", "100g", "250g", "500g", "1kg"],
  },
  silver_bar: {
    label: "Silver Bar",
    group: "investment",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: false,
      dimensions: true,
      stoneType: false,
      stoneCount: false,
      designStyle: false,
      finish: false,
    },
    defaultMetalType: "silver",
    sizeLabel: "Bar Size",
    sizeOptions: ["1g", "5g", "10g", "20g", "50g", "100g", "250g", "500g", "1kg", "5kg", "10kg"],
  },
  gold_coin: {
    label: "Gold Coin",
    group: "investment",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: false,
      dimensions: true,
      stoneType: false,
      stoneCount: false,
      designStyle: true,
      finish: false,
    },
    defaultMetalType: "gold",
    sizeLabel: "Coin Size",
    sizeOptions: ["1/10 oz", "1/4 oz", "1/2 oz", "1 oz", "2 oz", "5 oz", "10 oz"],
  },
  silver_coin: {
    label: "Silver Coin",
    group: "investment",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: false,
      dimensions: true,
      stoneType: false,
      stoneCount: false,
      designStyle: true,
      finish: false,
    },
    defaultMetalType: "silver",
    sizeLabel: "Coin Size",
    sizeOptions: ["1/10 oz", "1/4 oz", "1/2 oz", "1 oz", "2 oz", "5 oz", "10 oz"],
  },
  // Jewelry - Necklaces & Chains
  necklace: {
    label: "Necklace",
    group: "jewelry",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: true,
      dimensions: false,
      stoneType: true,
      stoneCount: true,
      designStyle: true,
      finish: true,
    },
    defaultMetalType: "gold",
    sizeLabel: "Chain Length",
    sizeOptions: ["14 inches", "16 inches", "18 inches", "20 inches", "22 inches", "24 inches", "Custom"],
  },
  chain: {
    label: "Chain",
    group: "jewelry",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: true,
      dimensions: false,
      stoneType: false,
      stoneCount: false,
      designStyle: true,
      finish: true,
    },
    defaultMetalType: "gold",
    sizeLabel: "Chain Length",
    sizeOptions: ["14 inches", "16 inches", "18 inches", "20 inches", "22 inches", "24 inches", "Custom"],
  },
  pendant: {
    label: "Pendant",
    group: "jewelry",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: false,
      dimensions: true,
      stoneType: true,
      stoneCount: true,
      designStyle: true,
      finish: true,
    },
    defaultMetalType: "gold",
  },
  choker: {
    label: "Choker",
    group: "jewelry",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: true,
      dimensions: false,
      stoneType: true,
      stoneCount: true,
      designStyle: true,
      finish: true,
    },
    defaultMetalType: "gold",
    sizeLabel: "Length",
    sizeOptions: ["14 inches", "15 inches", "16 inches", "Custom"],
  },
  // Jewelry - Bangles & Bracelets
  bangle: {
    label: "Bangle",
    group: "jewelry",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: true,
      dimensions: true,
      stoneType: true,
      stoneCount: true,
      designStyle: true,
      finish: true,
    },
    defaultMetalType: "gold",
    sizeLabel: "Diameter",
    sizeOptions: ["2.0 inches", "2.25 inches", "2.5 inches", "2.75 inches", "3.0 inches", "Custom"],
  },
  bracelet: {
    label: "Bracelet",
    group: "jewelry",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: true,
      dimensions: false,
      stoneType: true,
      stoneCount: true,
      designStyle: true,
      finish: true,
    },
    defaultMetalType: "gold",
    sizeLabel: "Length",
    sizeOptions: ["6 inches", "6.5 inches", "7 inches", "7.5 inches", "8 inches", "8.5 inches", "Custom"],
  },
  charm_bracelet: {
    label: "Charm Bracelet",
    group: "jewelry",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: true,
      dimensions: false,
      stoneType: true,
      stoneCount: true,
      designStyle: true,
      finish: true,
    },
    defaultMetalType: "gold",
    sizeLabel: "Length",
    sizeOptions: ["6 inches", "6.5 inches", "7 inches", "7.5 inches", "8 inches", "8.5 inches", "Custom"],
  },
  // Jewelry - Rings
  ring: {
    label: "Ring",
    group: "jewelry",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: true,
      dimensions: false,
      stoneType: true,
      stoneCount: true,
      designStyle: true,
      finish: true,
    },
    defaultMetalType: "gold",
    sizeLabel: "Ring Size",
    sizeOptions: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"],
  },
  engagement_ring: {
    label: "Engagement Ring",
    group: "jewelry",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: true,
      dimensions: false,
      stoneType: true,
      stoneCount: true,
      designStyle: true,
      finish: true,
    },
    defaultMetalType: "gold",
    sizeLabel: "Ring Size",
    sizeOptions: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"],
  },
  wedding_ring: {
    label: "Wedding Ring",
    group: "jewelry",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: true,
      dimensions: false,
      stoneType: false,
      stoneCount: false,
      designStyle: true,
      finish: true,
    },
    defaultMetalType: "gold",
    sizeLabel: "Ring Size",
    sizeOptions: ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"],
  },
  // Jewelry - Earrings
  earring: {
    label: "Earring",
    group: "jewelry",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: false,
      dimensions: true,
      stoneType: true,
      stoneCount: true,
      designStyle: true,
      finish: true,
    },
    defaultMetalType: "gold",
  },
  stud_earring: {
    label: "Stud Earring",
    group: "jewelry",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: false,
      dimensions: true,
      stoneType: true,
      stoneCount: true,
      designStyle: true,
      finish: true,
    },
    defaultMetalType: "gold",
  },
  hoop_earring: {
    label: "Hoop Earring",
    group: "jewelry",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: true,
      dimensions: false,
      stoneType: true,
      stoneCount: true,
      designStyle: true,
      finish: true,
    },
    defaultMetalType: "gold",
    sizeLabel: "Diameter",
    sizeOptions: ["10mm", "12mm", "15mm", "20mm", "25mm", "30mm", "40mm", "50mm", "Custom"],
  },
  drop_earring: {
    label: "Drop Earring",
    group: "jewelry",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: true,
      dimensions: true,
      stoneType: true,
      stoneCount: true,
      designStyle: true,
      finish: true,
    },
    defaultMetalType: "gold",
    sizeLabel: "Length",
    sizeOptions: ["20mm", "25mm", "30mm", "35mm", "40mm", "50mm", "60mm", "Custom"],
  },
  // Other Jewelry
  anklet: {
    label: "Anklet",
    group: "jewelry",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: true,
      dimensions: false,
      stoneType: true,
      stoneCount: true,
      designStyle: true,
      finish: true,
    },
    defaultMetalType: "gold",
    sizeLabel: "Length",
    sizeOptions: ["8 inches", "8.5 inches", "9 inches", "9.5 inches", "10 inches", "Custom"],
  },
  toe_ring: {
    label: "Toe Ring",
    group: "jewelry",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: true,
      dimensions: false,
      stoneType: true,
      stoneCount: true,
      designStyle: true,
      finish: true,
    },
    defaultMetalType: "gold",
    sizeLabel: "Size",
    sizeOptions: ["4", "5", "6", "7", "8", "9", "10", "11"],
  },
  other: {
    label: "Other",
    group: "jewelry",
    fields: {
      weight: true,
      purity: true,
      metalType: true,
      size: false,
      dimensions: true,
      stoneType: true,
      stoneCount: true,
      designStyle: true,
      finish: true,
    },
    defaultMetalType: "gold",
  },
};

export const categoryGroups = {
  investment: {
    label: "Investment Products",
    categories: ["gold_bar", "silver_bar", "gold_coin", "silver_coin"] as ProductCategory[],
  },
  jewelry: {
    label: "Jewelry",
    categories: [
      "necklace",
      "chain",
      "pendant",
      "choker",
      "bangle",
      "bracelet",
      "charm_bracelet",
      "ring",
      "engagement_ring",
      "wedding_ring",
      "earring",
      "stud_earring",
      "hoop_earring",
      "drop_earring",
      "anklet",
      "toe_ring",
      "other",
    ] as ProductCategory[],
  },
};

export const metalTypes: { value: MetalType; label: string }[] = [
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "platinum", label: "Platinum" },
  { value: "palladium", label: "Palladium" },
];

export const purityOptions = [
  "999.9",
  "999",
  "916",
  "835",
  "750",
  "585",
  "925",
  "800",
];

export const designStyles = [
  "Classic",
  "Modern",
  "Vintage",
  "Contemporary",
  "Traditional",
  "Art Deco",
  "Minimalist",
  "Ornate",
  "Custom",
];

export const finishOptions = [
  "Polished",
  "Matte",
  "Brushed",
  "Hammered",
  "Satin",
  "High Polish",
  "Antique",
  "Oxidized",
];

export const stoneTypes = [
  "Diamond",
  "Ruby",
  "Sapphire",
  "Emerald",
  "Pearl",
  "Amethyst",
  "Topaz",
  "Garnet",
  "Citrine",
  "Peridot",
  "Tanzanite",
  "Opal",
  "None",
];
