import { Document, Types } from "mongoose";

export interface ICartItem {
  productId: Types.ObjectId;
  name: string;
  image: string;
  price: number;
  countInStock: number;
  qty: number;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  isAdmin: boolean;
  createdAt: Date;
  cart: ICartItem[]; // ADD THIS
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
  brand: string;
  category: string;
  description: string;
  reviews: IReview[];
  rating: number;
  numReviews: number;
  price: number;
  countInStock: number;
}

export interface IOrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: Types.ObjectId;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  orderItems: IOrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
}
