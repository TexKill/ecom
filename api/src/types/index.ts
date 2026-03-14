import { Document, Types } from "mongoose";
import type {
  CartItemBase,
  FavoriteItemBase,
  OrderItemBase,
  OrderStatus,
  PaymentResult,
  ShippingAddress,
} from "./shared";

export type { OrderStatus } from "./shared";

export interface ICartItem extends CartItemBase<Types.ObjectId> {}

export interface IFavoriteItem extends FavoriteItemBase<Types.ObjectId> {}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt: Date;
  cart: ICartItem[];
  favorites: IFavoriteItem[];
  matchPassword(enteredPassword: string): Promise<boolean>;
}

export interface IReview {
  name: string;
  rating: number;
  comment: string;
  user: Types.ObjectId;
}

export interface IProduct extends Document {
  user: Types.ObjectId;
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

export interface IOrderItem extends OrderItemBase<Types.ObjectId> {}

export interface IOrder extends Document {
  user: Types.ObjectId;
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
}
