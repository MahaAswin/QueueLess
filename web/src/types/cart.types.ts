export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface Cart {
  id: string;
  shopId?: string;
  shopName?: string;
  items: CartItem[];
  totalItemCount: number;
  subtotal: number;
}
