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

export interface IFavoriteItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  countInStock: number;
}

export interface IOrderItem {
  name: string;
  qty: number;
  image: string;
  price: number;
  product: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface IOrder {
  _id: string;
  user: string | IUser;
  orderItems: IOrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    phoneNumber?: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentResult?: {
    id?: string;
    status?: string;
    update_time?: string;
    email_address?: string;
  };
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
