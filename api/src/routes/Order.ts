import express from "express";
import { AuthRequest } from "../types/auth";
import { Response } from "express";
import asyncHandler from "express-async-handler";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import { protect } from "../middleware/Auth";
import { admin } from "../middleware/Admin";
import { validateBody, validateParams } from "../middleware/Validate";
import {
  createOrderSchema,
  orderIdParamSchema,
  payOrderSchema,
  updateOrderStatusSchema,
} from "../validation/order";
import {
  decodeLiqPayPayload,
  encodeLiqPayPayload,
  isLiqPaySuccessStatus,
  signLiqPayData,
  verifyLiqPaySignature,
} from "../utils/liqpay";

const orderRoute = express.Router();
const liqPayCheckoutUrl = "https://www.liqpay.ua/api/3/checkout";

// @desc   Create new order
// @route  POST /api/orders
// @access Private
orderRoute.post(
  "/",
  protect,
  validateBody(createOrderSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    const uniqueProductIds: string[] = [
      ...new Set(
        (orderItems as Array<{ product: string }>)
          .map((item) => item.product?.toString())
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const products = await Product.find({
      _id: { $in: uniqueProductIds },
    }).select("_id name image price countInStock");

    if (products.length !== uniqueProductIds.length) {
      res.status(400);
      throw new Error("One or more products are invalid");
    }

    const productById = new Map(products.map((p) => [p._id.toString(), p]));

    const normalizedOrderItems = (
      orderItems as Array<{ product: string; qty: number }>
    ).map((item: { product: string; qty: number }) => {
      const product = productById.get(item.product?.toString());
      const qty = Number(item.qty);

      if (!product) {
        res.status(400);
        throw new Error(`Product not found: ${item.product}`);
      }
      if (!Number.isFinite(qty) || qty <= 0) {
        res.status(400);
        throw new Error("Invalid quantity in order item");
      }
      if (qty > product.countInStock) {
        res.status(400);
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      return {
        name: product.name,
        qty,
        image: product.image,
        price: product.price,
        product: product._id,
      };
    });

    const itemsPrice = normalizedOrderItems.reduce(
      (sum: number, item: { price: number; qty: number }) =>
        sum + item.price * item.qty,
      0,
    );
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const totalPrice = Number((itemsPrice + shippingPrice).toFixed(2));

    const qtyByProduct = normalizedOrderItems.reduce((acc, item) => {
      const key = item.product.toString();
      acc.set(key, (acc.get(key) || 0) + item.qty);
      return acc;
    }, new Map<string, number>());

    const stockUpdateOps = Array.from(qtyByProduct.entries()).map(
      ([productId, qty]) => ({
        updateOne: {
          filter: { _id: productId, countInStock: { $gte: qty } },
          update: { $inc: { countInStock: -qty } },
        },
      }),
    );

    const stockResult = await Product.bulkWrite(stockUpdateOps);
    if (stockResult.modifiedCount !== stockUpdateOps.length) {
      res.status(409);
      throw new Error("Unable to reserve stock for one or more products");
    }

    const order = new Order({
      user: req.user?._id,
      orderItems: normalizedOrderItems,
      shippingAddress,
      paymentMethod,
      shippingPrice,
      totalPrice,
      isPaid: false,
      isDelivered: false,
      status: "pending",
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  }),
);

// @desc   Get logged-in user orders
// @route  GET /api/orders/myorders
// @access Private
orderRoute.get(
  "/myorders",
  protect,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const orders = await Order.find({ user: req.user?._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  }),
);

// @desc   Get all orders
// @route  GET /api/orders
// @access Admin
orderRoute.get(
  "/",
  protect,
  admin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const pageSize = 20;
    const page = Number(req.query.page) || 1;

    const count = await Order.countDocuments({});
    const orders = await Order.find({})
      .populate("user", "id name email")
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
    });
  }),
);

// @desc   Create LiqPay checkout payload for order
// @route  POST /api/orders/:id/liqpay/checkout
// @access Private
orderRoute.post(
  "/:id/liqpay/checkout",
  protect,
  validateParams(orderIdParamSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    const isOwner = order.user.toString() === req.user?._id.toString();
    const isAdmin = Boolean(req.user?.isAdmin);

    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error("Not authorized to pay this order");
    }

    if (order.isPaid) {
      res.status(400);
      throw new Error("Order is already paid");
    }

    if (order.paymentMethod !== "bank_transfer") {
      res.status(400);
      throw new Error("LiqPay is available only for bank transfer orders");
    }

    const publicKey = process.env.LIQPAY_PUBLIC_KEY;
    const privateKey = process.env.LIQPAY_PRIVATE_KEY;
    const apiPublicUrl = process.env.API_PUBLIC_URL || "http://localhost:9000";
    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";

    if (!publicKey || !privateKey) {
      res.status(500);
      throw new Error("LiqPay keys are not configured");
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
      ...(process.env.LIQPAY_SANDBOX === "true" ? { sandbox: "1" } : {}),
    };

    const data = encodeLiqPayPayload(payload);
    const signature = signLiqPayData(privateKey, data);

    res.json({
      action: liqPayCheckoutUrl,
      data,
      signature,
    });
  }),
);

// @desc   LiqPay callback
// @route  POST /api/orders/liqpay/callback
// @access Public
orderRoute.post(
  "/liqpay/callback",
  express.urlencoded({ extended: false }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const privateKey = process.env.LIQPAY_PRIVATE_KEY;
    if (!privateKey) {
      res.status(500);
      throw new Error("LiqPay private key is not configured");
    }

    const data = String(req.body?.data || "");
    const signature = String(req.body?.signature || "");

    if (!data || !signature) {
      res.status(400);
      throw new Error("Invalid LiqPay callback payload");
    }

    if (!verifyLiqPaySignature(privateKey, data, signature)) {
      res.status(400);
      throw new Error("Invalid LiqPay signature");
    }

    const payload = decodeLiqPayPayload(data);
    const orderId = String(payload.order_id || "");

    if (!orderId) {
      res.status(400);
      throw new Error("LiqPay callback does not contain order_id");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      res.status(200).json({ ok: true });
      return;
    }

    const status = String(payload.status || "");
    const transactionId = String(payload.transaction_id || payload.payment_id || "");

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
    res.status(200).json({ ok: true });
  }),
);

// @desc   Get order by ID
// @route  GET /api/orders/:id
// @access Private
orderRoute.get(
  "/:id",
  protect,
  validateParams(orderIdParamSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      const isOwner = order.user.toString() === req.user?._id.toString();
      const isAdmin = Boolean(req.user?.isAdmin);

      if (!isOwner && !isAdmin) {
        res.status(403);
        throw new Error("Not authorized to view this order");
      }

      const populatedOrder = await order.populate("user", "name email");
      res.json(populatedOrder);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  }),
);

// @desc   Update order to paid
// @route  PUT /api/orders/:id/pay
// @access Private
orderRoute.put(
  "/:id/pay",
  protect,
  validateParams(orderIdParamSchema),
  validateBody(payOrderSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      const isOwner = order.user.toString() === req.user?._id.toString();
      const isAdmin = Boolean(req.user?.isAdmin);

      if (!isOwner && !isAdmin) {
        res.status(403);
        throw new Error("Not authorized to pay this order");
      }

      order.isPaid = true;
      order.paidAt = new Date();
      if (order.status === "pending") {
        order.status = "processing";
      }
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  }),
);

// @desc   Update order to delivered
// @route  PUT /api/orders/:id/deliver
// @access Admin
orderRoute.put(
  "/:id/deliver",
  protect,
  admin,
  validateParams(orderIdParamSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.status = "delivered";

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  }),
);

// @desc   Update order status
// @route  PUT /api/orders/:id/status
// @access Admin
orderRoute.put(
  "/:id/status",
  protect,
  admin,
  validateParams(orderIdParamSchema),
  validateBody(updateOrderStatusSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    const { status } = req.body as {
      status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
    };

    order.status = status;

    if (status === "delivered") {
      order.isDelivered = true;
      order.deliveredAt = order.deliveredAt || new Date();
    } else {
      order.isDelivered = false;
      order.deliveredAt = undefined;
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  }),
);

// @desc   Delete order
// @route  DELETE /api/orders/:id
// @access Admin
orderRoute.delete(
  "/:id",
  protect,
  admin,
  validateParams(orderIdParamSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      await order.deleteOne();
      res.json({ message: "Order removed" });
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  }),
);

export default orderRoute;
