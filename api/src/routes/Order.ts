import express, { Request, Response } from "express";
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
} from "../validation/order";

const orderRoute = express.Router();

// @desc   Create new order
// @route  POST /api/orders
// @access Private
orderRoute.post(
  "/",
  protect,
  validateBody(createOrderSchema),
  asyncHandler(async (req: Request, res: Response) => {
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

    const normalizedOrderItems = (orderItems as Array<{ product: string; qty: number }>).map(
      (item: { product: string; qty: number }) => {
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
      },
    );

    const itemsPrice = normalizedOrderItems.reduce(
      (sum: number, item: { price: number; qty: number }) =>
        sum + item.price * item.qty,
      0,
    );
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const totalPrice = Number((itemsPrice + shippingPrice).toFixed(2));

    const qtyByProduct = normalizedOrderItems.reduce(
      (acc, item) => {
        const key = item.product.toString();
        acc.set(key, (acc.get(key) || 0) + item.qty);
        return acc;
      },
      new Map<string, number>(),
    );

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
  validateParams(orderIdParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
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
  asyncHandler(async (req: Request, res: Response) => {
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
  validateParams(orderIdParamSchema),
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
