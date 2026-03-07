export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface ShippingAddress {
  address: string;
  city: string;
  phoneNumber: string;
  postalCode: string;
  country: string;
}

export interface PaymentResult {
  id: string;
  status: string;
  update_time: string;
  email_address: string;
}

export interface CartItemBase<TProductId = string> {
  productId: TProductId;
  name: string;
  image: string;
  price: number;
  countInStock: number;
  qty: number;
}

export interface FavoriteItemBase<TProductId = string> {
  productId: TProductId;
  name: string;
  image: string;
  price: number;
  countInStock: number;
}

export interface OrderItemBase<TProductId = string> {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: TProductId;
}

