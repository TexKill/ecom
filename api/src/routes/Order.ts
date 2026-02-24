import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Order } from "../models/Order";
import { protect } from "../middleware/Auth";
import { admin } from "../middleware/Admin";

const orderRoute = express.Router();

// @desc   Create new order
// @route  POST /api/orders
// @access Private
orderRoute.post(
  "/",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
    }

    const order = new Order({
      user: req.user?._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      shippingPrice,
      totalPrice,
      isPaid: false,
      isDelivered: false,
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
  asyncHandler(async (req: Request, res: Response) => {
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
  asyncHandler(async (req: Request, res: Response) => {
    const orders = await Order.find({})
      .populate("user", "id name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  }),
);

// @desc   Get order by ID
// @route  GET /api/orders/:id
// @access Private
orderRoute.get(
  "/:id",
  protect,
  asyncHandler(async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );

    if (order) {
      res.json(order);
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
  asyncHandler(async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = new Date();
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
  asyncHandler(async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = new Date();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  }),
);

// @desc   Delete order
// @route  DELETE /api/orders/:id
// @access Admin
orderRoute.delete(
  "/:id",
  protect,
  admin,
  asyncHandler(async (req: Request, res: Response) => {
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
