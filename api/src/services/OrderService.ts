import crypto from "crypto";
import { Order } from "../models/Order";
import { PaymentLog } from "../models/PaymentLog";
import { Product } from "../models/Product";
import { env } from "../config/env";
import { invalidateProductCaches } from "./ProductCacheService";
import {
  decodeLiqPayPayload,
  encodeLiqPayPayload,
  isLiqPaySuccessStatus,
  signLiqPayData,
  verifyLiqPaySignature,
} from "../utils/liqpay";
import { httpError } from "../utils/httpError";
import type { OrderStatus } from "../types";

const liqPayCheckoutUrl = "https://www.liqpay.ua/api/3/checkout";

export const createOrder = async (
  userId: string,
  payload: {
    orderItems: Array<{ product: string; qty: number }>;
    shippingAddress: {
      address: string;
      city: string;
      phoneNumber: string;
      postalCode: string;
      country: string;
    };
    paymentMethod: string;
  },
) => {
  const { orderItems, shippingAddress, paymentMethod } = payload;

  const uniqueProductIds: string[] = [
    ...new Set(
      orderItems.map((item) => item.product?.toString()).filter((id): id is string => Boolean(id)),
    ),
  ];

  const products = await Product.find({ _id: { $in: uniqueProductIds } }).select(
    "_id name image price countInStock",
  );

  if (products.length !== uniqueProductIds.length) {
    throw httpError(400, "One or more products are invalid");
  }

  const productById = new Map(products.map((p) => [p._id.toString(), p]));

  const normalizedOrderItems = orderItems.map((item) => {
    const product = productById.get(item.product?.toString());
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
      name: product.name,
      qty,
      image: product.image,
      price: product.price,
      product: product._id,
    };
  });

  const itemsPrice = normalizedOrderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const totalPrice = Number((itemsPrice + shippingPrice).toFixed(2));

  const qtyByProduct = normalizedOrderItems.reduce((acc, item) => {
    const key = item.product.toString();
    acc.set(key, (acc.get(key) || 0) + item.qty);
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

  const order = new Order({
    user: userId,
    orderItems: normalizedOrderItems,
    shippingAddress,
    paymentMethod,
    shippingPrice,
    totalPrice,
    isPaid: false,
    isDelivered: false,
    status: "pending",
  });

  return order.save();
};

export const getMyOrders = async (userId: string) =>
  Order.find({ user: userId }).sort({ createdAt: -1 });

export const getAllOrders = async (pageRaw: unknown) => {
  const pageSize = 20;
  const page = Number(pageRaw) || 1;

  const count = await Order.countDocuments({});
  const orders = await Order.find({})
    .populate("user", "id name email")
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  return {
    orders,
    page,
    pages: Math.ceil(count / pageSize),
  };
};

export const getAdminOrderStats = async () => {
  const [totalOrders, paidOrders, deliveredOrders, pendingOrders, revenueStats, paidRevenueStats] =
    await Promise.all([
      Order.countDocuments({}),
      Order.countDocuments({ isPaid: true }),
      Order.countDocuments({ isDelivered: true }),
      Order.countDocuments({ status: "pending" }),
      Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } }]),
      Order.aggregate([
        { $match: { isPaid: true } },
        { $group: { _id: null, paidRevenue: { $sum: "$totalPrice" } } },
      ]),
    ]);

  const unpaidOrders = Math.max(totalOrders - paidOrders, 0);
  const totalRevenue = Number(revenueStats[0]?.totalRevenue || 0);
  const paidRevenue = Number(paidRevenueStats[0]?.paidRevenue || 0);
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

  const filter: Record<string, unknown> = { provider: "liqpay" };
  if (status) filter.status = status;

  if (dateFromRaw || dateToRaw) {
    const processedAt: Record<string, Date> = {};

    if (dateFromRaw) {
      const fromDate = new Date(dateFromRaw);
      if (Number.isNaN(fromDate.getTime())) {
        throw httpError(400, "Invalid dateFrom format");
      }
      processedAt.$gte = fromDate;
    }

    if (dateToRaw) {
      const toDate = new Date(dateToRaw);
      if (Number.isNaN(toDate.getTime())) {
        throw httpError(400, "Invalid dateTo format");
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateToRaw)) {
        toDate.setHours(23, 59, 59, 999);
      }
      processedAt.$lte = toDate;
    }

    filter.processedAt = processedAt;
  }

  const count = await PaymentLog.countDocuments(filter);
  const logs = await PaymentLog.find(filter)
    .sort({ processedAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  if (count === 0) {
    const orderFilter: Record<string, unknown> = {
      "paymentResult.id": { $exists: true, $nin: ["", null] },
    };

    if (status) {
      orderFilter["paymentResult.status"] = status;
    }

    if (dateFromRaw || dateToRaw) {
      const paidAt: Record<string, Date> = {};

      if (dateFromRaw) {
        const fromDate = new Date(dateFromRaw);
        if (Number.isNaN(fromDate.getTime())) {
          throw httpError(400, "Invalid dateFrom format");
        }
        paidAt.$gte = fromDate;
      }

      if (dateToRaw) {
        const toDate = new Date(dateToRaw);
        if (Number.isNaN(toDate.getTime())) {
          throw httpError(400, "Invalid dateTo format");
        }
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateToRaw)) {
          toDate.setHours(23, 59, 59, 999);
        }
        paidAt.$lte = toDate;
      }

      orderFilter.paidAt = paidAt;
    }

    const fallbackCount = await Order.countDocuments(orderFilter);
    const fallbackOrders = await Order.find(orderFilter)
      .sort({ paidAt: -1, createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .select("_id paymentResult paidAt createdAt");

    const fallbackLogs = fallbackOrders.map((order) => ({
      _id: `order-${order._id.toString()}`,
      provider: "liqpay",
      orderId: order._id.toString(),
      order: order._id,
      transactionId: order.paymentResult?.id || "",
      status: order.paymentResult?.status || "",
      processedAt: order.paidAt || (order as any).createdAt,
    }));

    return {
      logs: fallbackLogs,
      page,
      pages: Math.max(1, Math.ceil(fallbackCount / pageSize)),
      total: fallbackCount,
      fallback: true,
    };
  }

  return {
    logs,
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
  const order = await Order.findById(orderId);

  if (!order) {
    throw httpError(404, "Order not found");
  }

  const isOwner = order.user.toString() === userId;
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
    description: `Order #${order._id.toString().slice(-8)}`,
    order_id: order._id.toString(),
    server_url: `${apiPublicUrl}/api/orders/liqpay/callback`,
    result_url: `${clientUrl}/orders/${order._id.toString()}`,
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
    const existingOrder = await Order.findById(orderId).select("_id");
    await PaymentLog.create({
      provider: "liqpay",
      orderId,
      order: existingOrder?._id,
      transactionId,
      status,
      callbackHash,
      payload,
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      return { ok: true, duplicate: true };
    }
    throw error;
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return { ok: true };
  }

  if (isLiqPaySuccessStatus(status) && !order.isPaid) {
    order.isPaid = true;
    order.paidAt = new Date();
    if (order.status === "pending") {
      order.status = "processing";
    }
  }

  order.paymentResult = {
    id: transactionId || order.paymentResult?.id || "",
    status,
    update_time: String(payload.end_date || Date.now()),
    email_address: String(payload.sender || ""),
  };

  await order.save();
  return { ok: true };
};

export const getOrderByIdForUser = async (args: {
  orderId: string;
  userId: string;
  isAdmin: boolean;
}) => {
  const { orderId, userId, isAdmin } = args;
  const order = await Order.findById(orderId);

  if (!order) {
    throw httpError(404, "Order not found");
  }

  const isOwner = order.user.toString() === userId;
  if (!isOwner && !isAdmin) {
    throw httpError(403, "Not authorized to view this order");
  }

  return order.populate("user", "name email");
};

export const markOrderPaid = async (args: {
  orderId: string;
  userId: string;
  isAdmin: boolean;
  payment: { id: string; status: string; update_time: string; email_address: string };
}) => {
  const { orderId, userId, isAdmin, payment } = args;
  const order = await Order.findById(orderId);

  if (!order) {
    throw httpError(404, "Order not found");
  }

  const isOwner = order.user.toString() === userId;
  if (!isOwner && !isAdmin) {
    throw httpError(403, "Not authorized to pay this order");
  }

  order.isPaid = true;
  order.paidAt = new Date();
  if (order.status === "pending") {
    order.status = "processing";
  }
  order.paymentResult = payment;

  return order.save();
};

export const markOrderDelivered = async (orderId: string) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw httpError(404, "Order not found");
  }

  order.isDelivered = true;
  order.deliveredAt = new Date();
  order.status = "delivered";

  return order.save();
};

export const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw httpError(404, "Order not found");
  }

  order.status = status;
  if (status === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = order.deliveredAt || new Date();
  } else {
    order.isDelivered = false;
    order.deliveredAt = undefined;
  }

  return order.save();
};

export const deleteOrder = async (orderId: string) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw httpError(404, "Order not found");
  }

  await order.deleteOne();
  return { message: "Order removed" };
};
