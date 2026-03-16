import crypto from "crypto";
import { Prisma, OrderStatus as PrismaOrderStatus } from "@prisma/client";
import { prisma } from "../db/commerce";
import { Product } from "../models/Product";
import { env } from "../config/env";
import { invalidateProductCaches } from "./ProductCacheService";
import { validatePromoCodeForSubtotal } from "./PromoCodeService";
import {
  decodeLiqPayPayload,
  encodeLiqPayPayload,
  isLiqPaySuccessStatus,
  signLiqPayData,
  verifyLiqPaySignature,
} from "../utils/liqpay";
import { httpError } from "../utils/httpError";
import type { OrderStatus } from "../types";
import type { PaymentResult, ShippingAddress } from "../types/shared";
import { generateDbId } from "../utils/ids";
import { toApiOrder, toApiPaymentLog } from "../utils/commerceSerializers";

const liqPayCheckoutUrl = "https://www.liqpay.ua/api/3/checkout";

const orderUserSelect = {
  id: true,
  name: true,
  email: true,
  isAdmin: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

const parseDateInput = (value: string, label: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw httpError(400, `Invalid ${label} format`);
  }
  return parsed;
};

export const createOrder = async (
  userId: string,
  payload: {
    orderItems: Array<{ product: string; qty: number }>;
    shippingAddress: ShippingAddress;
    paymentMethod: string;
    promoCode?: string;
  },
) => {
  const { orderItems, shippingAddress, paymentMethod, promoCode } = payload;

  const uniqueProductIds = [...new Set(orderItems.map((item) => item.product).filter(Boolean))];

  const products = await Product.find({ _id: { $in: uniqueProductIds } }).select(
    "_id name image price countInStock",
  );

  if (products.length !== uniqueProductIds.length) {
    throw httpError(400, "One or more products are invalid");
  }

  const productById = new Map(products.map((product) => [product._id.toString(), product]));

  const normalizedOrderItems = orderItems.map((item) => {
    const product = productById.get(item.product);
    const qty = Number(item.qty);

    if (!product) {
      throw httpError(400, `Product not found: ${item.product}`);
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      throw httpError(400, "Invalid quantity in order item");
    }
    if (qty > product.countInStock) {
      throw httpError(400, `Insufficient stock for product: ${product.name}`);
    }

    return {
      productId: product._id.toString(),
      name: product.name,
      qty,
      image: product.image,
      price: product.price,
    };
  });

  const itemsPrice = normalizedOrderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const promoValidation = promoCode
    ? await validatePromoCodeForSubtotal(promoCode, itemsPrice)
    : null;
  const discountAmount = promoValidation?.discountAmount || 0;
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = Number((itemsPrice - discountAmount + shippingPrice).toFixed(2));

  const qtyByProduct = normalizedOrderItems.reduce((acc, item) => {
    acc.set(item.productId, (acc.get(item.productId) || 0) + item.qty);
    return acc;
  }, new Map<string, number>());

  const stockUpdateOps = Array.from(qtyByProduct.entries()).map(([productId, qty]) => ({
    updateOne: {
      filter: { _id: productId, countInStock: { $gte: qty } },
      update: { $inc: { countInStock: -qty } },
    },
  }));

  const stockResult = await Product.bulkWrite(stockUpdateOps);
  if (stockResult.modifiedCount !== stockUpdateOps.length) {
    throw httpError(409, "Unable to reserve stock for one or more products");
  }
  await invalidateProductCaches();

  const createdOrder = await prisma.order.create({
    data: {
      id: generateDbId(),
      userId,
      shippingAddress: shippingAddress as unknown as Prisma.InputJsonValue,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      discountAmount,
      promoCode: promoValidation
        ? ({
            code: promoValidation.promoCode.code,
            type: promoValidation.promoCode.type,
            value: promoValidation.promoCode.value,
          } as Prisma.InputJsonValue)
        : undefined,
      totalPrice,
      isPaid: false,
      isDelivered: false,
      status: PrismaOrderStatus.pending,
      orderItems: {
        create: normalizedOrderItems.map((item) => ({
          id: generateDbId(),
          productId: item.productId,
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
        })),
      },
    },
    include: { orderItems: true },
  });

  return toApiOrder(createdOrder);
};

export const getMyOrders = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { orderItems: true },
    orderBy: { createdAt: "desc" },
  });

  return orders.map(toApiOrder);
};

export const getAllOrders = async (pageRaw: unknown) => {
  const pageSize = 20;
  const page = Number(pageRaw) || 1;

  const [count, orders] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({
      include: {
        user: { select: orderUserSelect },
        orderItems: true,
      },
      orderBy: { createdAt: "desc" },
      skip: pageSize * (page - 1),
      take: pageSize,
    }),
  ]);

  return {
    orders: orders.map(toApiOrder),
    page,
    pages: Math.ceil(count / pageSize),
  };
};

export const getAdminOrderStats = async () => {
  const [totalOrders, paidOrders, deliveredOrders, pendingOrders, revenueStats, paidRevenueStats] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { isPaid: true } }),
      prisma.order.count({ where: { isDelivered: true } }),
      prisma.order.count({ where: { status: PrismaOrderStatus.pending } }),
      prisma.order.aggregate({ _sum: { totalPrice: true } }),
      prisma.order.aggregate({
        where: { isPaid: true },
        _sum: { totalPrice: true },
      }),
    ]);

  const unpaidOrders = Math.max(totalOrders - paidOrders, 0);
  const totalRevenue = Number(revenueStats._sum.totalPrice || 0);
  const paidRevenue = Number(paidRevenueStats._sum.totalPrice || 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalOrders,
    paidOrders,
    unpaidOrders,
    deliveredOrders,
    pendingOrders,
    totalRevenue,
    paidRevenue,
    averageOrderValue,
  };
};

export const getPaymentLogs = async (query: {
  page?: unknown;
  status?: unknown;
  dateFrom?: unknown;
  dateTo?: unknown;
}) => {
  const pageSize = 20;
  const page = Math.max(1, Number(query.page) || 1);

  const status = String(query.status || "").trim();
  const dateFromRaw = String(query.dateFrom || "").trim();
  const dateToRaw = String(query.dateTo || "").trim();

  const where: Prisma.PaymentLogWhereInput = {};
  if (status) where.status = status;

  if (dateFromRaw || dateToRaw) {
    const processedAt: Prisma.DateTimeFilter = {};

    if (dateFromRaw) {
      processedAt.gte = parseDateInput(dateFromRaw, "dateFrom");
    }

    if (dateToRaw) {
      const toDate = parseDateInput(dateToRaw, "dateTo");
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateToRaw)) {
        toDate.setHours(23, 59, 59, 999);
      }
      processedAt.lte = toDate;
    }

    where.processedAt = processedAt;
  }

  const [count, logs] = await Promise.all([
    prisma.paymentLog.count({ where }),
    prisma.paymentLog.findMany({
      where,
      orderBy: { processedAt: "desc" },
      skip: pageSize * (page - 1),
      take: pageSize,
    }),
  ]);

  return {
    logs: logs.map(toApiPaymentLog),
    page,
    pages: Math.max(1, Math.ceil(count / pageSize)),
    total: count,
  };
};

export const createLiqPayCheckout = async (args: {
  orderId: string;
  userId: string;
  isAdmin: boolean;
}) => {
  const { orderId, userId, isAdmin } = args;
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw httpError(404, "Order not found");
  }

  const isOwner = order.userId === userId;
  if (!isOwner && !isAdmin) {
    throw httpError(403, "Not authorized to pay this order");
  }

  if (order.isPaid) {
    throw httpError(400, "Order is already paid");
  }

  if (order.paymentMethod !== "bank_transfer") {
    throw httpError(400, "LiqPay is available only for bank transfer orders");
  }

  const publicKey = env.LIQPAY_PUBLIC_KEY;
  const privateKey = env.LIQPAY_PRIVATE_KEY;
  const apiPublicUrl = env.API_PUBLIC_URL;
  const clientUrl = env.CLIENT_URL;

  if (!publicKey || !privateKey) {
    throw httpError(500, "LiqPay keys are not configured");
  }

  const payload = {
    version: "3",
    public_key: publicKey,
    action: "pay",
    amount: order.totalPrice.toFixed(2),
    currency: "UAH",
    description: `Order #${order.id.slice(-8)}`,
    order_id: order.id,
    server_url: `${apiPublicUrl}/api/orders/liqpay/callback`,
    result_url: `${clientUrl}/orders/${order.id}`,
    language: "uk",
    ...(env.LIQPAY_SANDBOX ? { sandbox: "1" } : {}),
  };

  const data = encodeLiqPayPayload(payload);
  const signature = signLiqPayData(privateKey, data);

  return {
    action: liqPayCheckoutUrl,
    data,
    signature,
  };
};

export const handleLiqPayCallback = async (body: unknown) => {
  const privateKey = env.LIQPAY_PRIVATE_KEY;
  if (!privateKey) {
    throw httpError(500, "LiqPay private key is not configured");
  }

  const rawBody = (body || {}) as { data?: unknown; signature?: unknown };
  const data = String(rawBody.data || "");
  const signature = String(rawBody.signature || "");

  if (!data || !signature) {
    throw httpError(400, "Invalid LiqPay callback payload");
  }

  if (!verifyLiqPaySignature(privateKey, data, signature)) {
    throw httpError(400, "Invalid LiqPay signature");
  }

  const callbackHash = crypto
    .createHash("sha256")
    .update(`${data}:${signature}`, "utf8")
    .digest("hex");

  const payload = decodeLiqPayPayload(data);
  const orderId = String(payload.order_id || "");

  if (!orderId) {
    throw httpError(400, "LiqPay callback does not contain order_id");
  }

  const status = String(payload.status || "");
  const transactionId = String(payload.transaction_id || payload.payment_id || "");

  try {
    await prisma.paymentLog.create({
      data: {
        id: generateDbId(),
        provider: "liqpay",
        orderId,
        transactionId,
        status,
        callbackHash,
        payload: payload as Prisma.InputJsonValue,
      },
    });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: true, duplicate: true };
    }
    throw error;
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    return { ok: true };
  }

  const paymentResult: PaymentResult = {
    id: transactionId || "",
    status,
    update_time: String(payload.end_date || Date.now()),
    email_address: String(payload.sender || ""),
  };

  await prisma.order.update({
    where: { id: orderId },
    data: {
      isPaid: isLiqPaySuccessStatus(status) ? true : order.isPaid,
      paidAt: isLiqPaySuccessStatus(status) && !order.isPaid ? new Date() : order.paidAt,
      status:
        isLiqPaySuccessStatus(status) && order.status === PrismaOrderStatus.pending
          ? PrismaOrderStatus.processing
          : order.status,
      paymentResult: paymentResult as unknown as Prisma.InputJsonValue,
    },
  });

  return { ok: true };
};

export const getOrderByIdForUser = async (args: {
  orderId: string;
  userId: string;
  isAdmin: boolean;
}) => {
  const { orderId, userId, isAdmin } = args;
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: orderUserSelect },
      orderItems: true,
    },
  });

  if (!order) {
    throw httpError(404, "Order not found");
  }

  const isOwner = order.userId === userId;
  if (!isOwner && !isAdmin) {
    throw httpError(403, "Not authorized to view this order");
  }

  return toApiOrder(order);
};

export const markOrderPaid = async (args: {
  orderId: string;
  userId: string;
  isAdmin: boolean;
  payment: PaymentResult;
}) => {
  const { orderId, userId, isAdmin, payment } = args;
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw httpError(404, "Order not found");
  }

  const isOwner = order.userId === userId;
  if (!isOwner && !isAdmin) {
    throw httpError(403, "Not authorized to pay this order");
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      isPaid: true,
      paidAt: new Date(),
      status:
        order.status === PrismaOrderStatus.pending
          ? PrismaOrderStatus.processing
          : order.status,
      paymentResult: payment as unknown as Prisma.InputJsonValue,
    },
    include: { orderItems: true },
  });

  return toApiOrder(updatedOrder);
};

export const markOrderDelivered = async (orderId: string) => {
  const existing = await prisma.order.findUnique({ where: { id: orderId } });

  if (!existing) {
    throw httpError(404, "Order not found");
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      isDelivered: true,
      deliveredAt: new Date(),
      status: PrismaOrderStatus.delivered,
    },
    include: { orderItems: true },
  });

  return toApiOrder(updatedOrder);
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const existing = await prisma.order.findUnique({ where: { id: orderId } });

  if (!existing) {
    throw httpError(404, "Order not found");
  }

  const nextStatus = status as PrismaOrderStatus;
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: nextStatus,
      isDelivered: nextStatus === PrismaOrderStatus.delivered,
      deliveredAt:
        nextStatus === PrismaOrderStatus.delivered ? existing.deliveredAt || new Date() : null,
    },
    include: { orderItems: true },
  });

  return toApiOrder(updatedOrder);
};

export const deleteOrder = async (orderId: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    throw httpError(404, "Order not found");
  }

  await prisma.order.delete({ where: { id: orderId } });
  return { message: "Order removed" };
};
