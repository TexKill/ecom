import type {
  CartItem,
  FavoriteItem,
  Order,
  OrderItem,
  PaymentLog,
  PromoCode,
  Subscriber,
  User,
} from "@prisma/client";
import type {
  ICartItem,
  IFavoriteItem,
  IOrder,
  IOrderItem,
  IPromoCode,
  ISubscriber,
  IUser,
} from "../types";
import type { PaymentResult, ShippingAddress } from "../types/shared";

type JsonObject = Record<string, unknown>;

const asObject = (value: unknown): JsonObject | undefined =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as JsonObject) : undefined;

export const toApiUser = (user: Pick<User, "id" | "name" | "email" | "isAdmin" | "createdAt">): IUser => ({
  _id: user.id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
  createdAt: user.createdAt,
});

export const toApiCartItem = (item: CartItem): ICartItem => ({
  productId: item.productId,
  name: item.name,
  image: item.image,
  price: item.price,
  countInStock: item.countInStock,
  qty: item.qty,
});

export const toApiFavoriteItem = (item: FavoriteItem): IFavoriteItem => ({
  productId: item.productId,
  name: item.name,
  image: item.image,
  price: item.price,
  countInStock: item.countInStock,
});

export const toApiPromoCode = (promoCode: PromoCode): IPromoCode => ({
  _id: promoCode.id,
  code: promoCode.code,
  type: promoCode.type,
  value: promoCode.value,
  minOrderAmount: promoCode.minOrderAmount,
  isActive: promoCode.isActive,
  expiresAt: promoCode.expiresAt || undefined,
  createdAt: promoCode.createdAt,
  updatedAt: promoCode.updatedAt,
});

export const toApiSubscriber = (subscriber: Subscriber): ISubscriber => ({
  _id: subscriber.id,
  email: subscriber.email,
  createdAt: subscriber.createdAt,
});

export const toApiOrderItem = (item: OrderItem): IOrderItem => ({
  product: item.productId,
  name: item.name,
  qty: item.qty,
  image: item.image,
  price: item.price,
});

export const toApiOrder = (
  order: Order & {
    orderItems: OrderItem[];
    user?: Pick<User, "id" | "name" | "email" | "isAdmin" | "createdAt">;
  },
): IOrder => {
  const shippingAddress = asObject(order.shippingAddress) as ShippingAddress | undefined;
  const paymentResult = asObject(order.paymentResult) as PaymentResult | undefined;
  const promoCode = asObject(order.promoCode) as IOrder["promoCode"] | undefined;

  return {
    _id: order.id,
    user: order.user
      ? {
          _id: order.user.id,
          name: order.user.name,
          email: order.user.email,
          isAdmin: order.user.isAdmin,
          createdAt: order.user.createdAt,
        }
      : order.userId,
    orderItems: order.orderItems.map(toApiOrderItem),
    shippingAddress: shippingAddress as ShippingAddress,
    paymentMethod: order.paymentMethod,
    paymentResult,
    itemsPrice: order.itemsPrice,
    shippingPrice: order.shippingPrice,
    discountAmount: order.discountAmount,
    promoCode,
    totalPrice: order.totalPrice,
    isPaid: order.isPaid,
    paidAt: order.paidAt || undefined,
    isDelivered: order.isDelivered,
    deliveredAt: order.deliveredAt || undefined,
    status: order.status,
    createdAt: order.createdAt,
  };
};

export const toApiPaymentLog = (log: PaymentLog) => ({
  _id: log.id,
  provider: log.provider,
  orderId: log.orderId,
  transactionId: log.transactionId,
  status: log.status,
  processedAt: log.processedAt,
  createdAt: log.createdAt,
});
