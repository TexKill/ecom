import type {
  FavoriteItemBase,
  OrderItemBase,
  OrderStatus,
  PaymentResult,
  ShippingAddress,
} from "../../../api/src/types/shared";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token?: string;
  createdAt?: string;
}

export interface IReview {
  _id?: string;
  name: string;
  rating: number;
  comment: string;
  user: string;
  createdAt?: string;
}

export interface IProduct {
  _id: string;
  name: string;
  image: string;
  brand: string;
  category: string;
  description: string;
  descriptionUk?: string;
  descriptionEn?: string;
  reviews: IReview[];
  rating: number;
  numReviews: number;
  price: number;
  countInStock: number;
}

export type IFavoriteItem = FavoriteItemBase<string>;

export type { OrderStatus, ShippingAddress };
export type IOrderItem = OrderItemBase<string>;

export interface IOrder {
  _id: string;
  user: string | IUser;
  orderItems: IOrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: Partial<PaymentResult>;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: OrderStatus;
  createdAt?: string;
}

export interface IPaymentLog {
  _id: string;
  provider: string;
  orderId: string;
  transactionId: string;
  status: string;
  processedAt?: string;
  createdAt?: string;
}
