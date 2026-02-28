import express, { Request, Response } from "express";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { protect } from "../middleware/Auth";
import { validateBody } from "../middleware/Validate";
import { toggleFavoriteSchema } from "../validation/favorites";

const router = express.Router();

// GET /api/favorites
router.get("/", protect, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user!._id).select("favorites").lean();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user.favorites || []);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/favorites/toggle
router.post(
  "/toggle",
  protect,
  validateBody(toggleFavoriteSchema),
  async (req: Request, res: Response) => {
    try {
      const { productId } = req.body as { productId: string };

      const product = await Product.findById(productId).select(
        "_id name image price countInStock",
      );

      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      const user = await User.findById(req.user!._id);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const existingIndex = user.favorites.findIndex(
        (item) => item.productId.toString() === productId,
      );

      if (existingIndex >= 0) {
        user.favorites.splice(existingIndex, 1);
        await user.save();
        res.json({ action: "removed", items: user.favorites });
        return;
      }

      user.favorites.push({
        productId: product._id,
        name: product.name,
        image: product.image,
        price: product.price,
        countInStock: product.countInStock,
      } as any);

      await user.save();
      res.json({ action: "added", items: user.favorites });
    } catch {
      res.status(500).json({ message: "Server error" });
    }
  },
);

// DELETE /api/favorites
router.delete("/", protect, async (req: Request, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.user!._id, { favorites: [] });
    res.json({ message: "Favorites cleared" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
