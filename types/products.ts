export type ProductCategory = "coin" | "bar" | "jewellery";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  images: string[];
  price?: number;
  weight?: number;
  purity?: string;
  createdAt: Date;
  updatedAt: Date;
}

