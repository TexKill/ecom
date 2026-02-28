import express, { Request, Response } from "express";
import { User } from "../models/User";
import { protect } from "../middleware/Auth";
import { validateBody } from "../middleware/Validate";
import { syncCartSchema } from "../validation/cart";

const router = express.Router();

// GET /api/cart
router.get("/", protect, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!._id).select("cart").lean();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user.cart);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/cart
router.post(
  "/",
  protect,
  validateBody(syncCartSchema),
  async (req: Request, res: Response) => {
    try {
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

      const user = await User.findByIdAndUpdate(
        req.user!._id,
        { $set: { cart: items } },
        { returnDocument: "after" },
      ).select("cart");

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      res.json(user.cart);
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// DELETE /api/cart
router.delete("/", protect, async (req: Request, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.user!._id, { cart: [] });
    res.json({ message: "Cart cleared" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
