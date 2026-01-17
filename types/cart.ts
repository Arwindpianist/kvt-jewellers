export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantId?: string;
  variantOptions?: {
    size?: string;
    finish?: string;
    metalType?: string;
    designStyle?: string;
    stoneType?: string;
  };
}

export interface Cart {
  items: CartItem[];
  total: number;
}