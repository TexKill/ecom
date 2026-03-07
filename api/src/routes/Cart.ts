import express from "express";
import { AuthRequest } from "../types/auth";
import { Response } from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/Auth";
import { validateBody } from "../middleware/Validate";
import { syncCartSchema } from "../validation/cart";
import {
  clearCartByUserId,
  getCartByUserId,
  syncCartByUserId,
} from "../services/CartService";

const router = express.Router();

// GET /api/cart
router.get(
  "/",
  protect,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const cart = await getCartByUserId(req.user!._id.toString());
    res.json(cart);
  }),
);

// POST /api/cart
router.post(
  "/",
  protect,
  validateBody(syncCartSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { items } = req.body as {
      items: Array<{
        productId: string;
        name: string;
        image: string;
        price: number;
        countInStock: number;
        qty: number;
      }>;
    };
    const cart = await syncCartByUserId(req.user!._id.toString(), items);
    res.json(cart);
  }),
);

// DELETE /api/cart
router.delete(
  "/",
  protect,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await clearCartByUserId(req.user!._id.toString());
    res.json({ message: "Cart cleared" });
  }),
);

export default router;
