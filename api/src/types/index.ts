import { Document } from "mongoose";
import type {
  CartItemBase,
  FavoriteItemBase,
  OrderItemBase,
  OrderStatus,
  PaymentResult,
  ShippingAddress,
} from "./shared";

export type { OrderStatus } from "./shared";

export interface ICartItem extends CartItemBase<string> {}

export interface IFavoriteItem extends FavoriteItemBase<string> {}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
}

export interface IReview {
  name: string;
  rating: number;
  comment: string;
  user: string;
}

export interface IProduct extends Document {
  user: string;
  name: string;
  image: string;
  images: string[];
  brand: string;
  category: string;
  description: string;
  descriptionUk: string;
  descriptionEn: string;
  reviews: IReview[];
  rating: number;
  numReviews: number;
  price: number;
  countInStock: number;
}

export interface IOrderItem extends OrderItemBase<string> {}

export interface IOrder {
  _id: string;
  user: string | IUser;
  orderItems: IOrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: PaymentResult;
  itemsPrice: number;
  shippingPrice: number;
  discountAmount: number;
  promoCode?: {
    code: string;
    type: "percent" | "fixed";
    value: number;
  };
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  status: OrderStatus;
  createdAt?: Date;
}

export interface IPromoCode {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrderAmount: number;
  isActive: boolean;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubscriber {
  _id: string;
  email: string;
  createdAt?: Date;
}
