export interface CartItem {
  id?: string;
  itemId?: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface Cart {
  id?: string;
  cartId?: string;
  shopId?: string;
  shopName?: string;
  items: CartItem[];
  totalItemCount: number;
  subtotal: number;
}
