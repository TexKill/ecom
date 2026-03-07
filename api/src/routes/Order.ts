import express from "express";
import { AuthRequest } from "../types/auth";
import { Response } from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/Auth";
import { admin } from "../middleware/Admin";
import { validateBody, validateParams } from "../middleware/Validate";
import {
  createOrderSchema,
  orderIdParamSchema,
  payOrderSchema,
  updateOrderStatusSchema,
} from "../validation/order";
import { env } from "../config/env";
import { createRateLimit } from "../middleware/RateLimit";
import {
  createLiqPayCheckout,
  createOrder,
  deleteOrder,
  getAdminOrderStats,
  getAllOrders,
  getMyOrders,
  getOrderByIdForUser,
  getPaymentLogs,
  handleLiqPayCallback,
  markOrderDelivered,
  markOrderPaid,
  updateOrderStatus,
} from "../services/OrderService";

const orderRoute = express.Router();
const liqpayCallbackRateLimit = createRateLimit({
  bucket: "liqpay-callback",
  windowMs: env.LIQPAY_CALLBACK_RATE_LIMIT_WINDOW_MS,
  maxRequests: env.LIQPAY_CALLBACK_RATE_LIMIT_MAX_REQUESTS,
  message: "Too many LiqPay callback requests. Please try again later.",
});

// @desc   Create new order
// @route  POST /api/orders
// @access Private
orderRoute.post(
  "/",
  protect,
  validateBody(createOrderSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const createdOrder = await createOrder(req.user!._id.toString(), req.body);
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
    const orders = await getMyOrders(req.user!._id.toString());
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
    const result = await getAllOrders(req.query.page);
    res.json(result);
  }),
);

// @desc   Get admin order stats
// @route  GET /api/orders/stats
// @access Admin
orderRoute.get(
  "/stats",
  protect,
  admin,
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const stats = await getAdminOrderStats();
    res.json(stats);
  }),
);

// @desc   Get LiqPay payment logs
// @route  GET /api/orders/payment-logs
// @access Admin
orderRoute.get(
  "/payment-logs",
  protect,
  admin,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await getPaymentLogs(req.query);
    res.json(result);
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
    const orderId = String(req.params.id);
    const result = await createLiqPayCheckout({
      orderId,
      userId: req.user!._id.toString(),
      isAdmin: Boolean(req.user?.isAdmin),
    });
    res.json(result);
  }),
);

// @desc   LiqPay callback
// @route  POST /api/orders/liqpay/callback
// @access Public
orderRoute.post(
  "/liqpay/callback",
  liqpayCallbackRateLimit,
  express.urlencoded({ extended: false }),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await handleLiqPayCallback(req.body);
    res.status(200).json(result);
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
    const orderId = String(req.params.id);
    const order = await getOrderByIdForUser({
      orderId,
      userId: req.user!._id.toString(),
      isAdmin: Boolean(req.user?.isAdmin),
    });
    res.json(order);
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
    const orderId = String(req.params.id);
    const updatedOrder = await markOrderPaid({
      orderId,
      userId: req.user!._id.toString(),
      isAdmin: Boolean(req.user?.isAdmin),
      payment: {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      },
    });
    res.json(updatedOrder);
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
    const updatedOrder = await markOrderDelivered(String(req.params.id));
    res.json(updatedOrder);
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
    const updatedOrder = await updateOrderStatus(String(req.params.id), req.body.status);
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
    const result = await deleteOrder(String(req.params.id));
    res.json(result);
  }),
);

export default orderRoute;
