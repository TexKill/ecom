export interface IUser {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token?: string;
  createdAt?: string;
}

export interface IReview {
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
  product: string;
}

export interface IOrder {
  _id: string;
  user: string | IUser;
  orderItems: IOrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt?: string;
}
