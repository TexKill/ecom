import { AuthRequest } from "../types/auth";
import { Response } from "express";
import express from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/Auth";
import { validateBody } from "../middleware/Validate";
import { toggleFavoriteSchema } from "../validation/favorites";
import {
  clearFavoritesByUserId,
  getFavoritesByUserId,
  toggleFavoriteByUserId,
} from "../services/FavoritesService";

const router = express.Router();

// GET /api/favorites
router.get(
  "/",
  protect,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const favorites = await getFavoritesByUserId(req.user!._id.toString());
    res.json(favorites);
  }),
);

// POST /api/favorites/toggle
router.post(
  "/toggle",
  protect,
  validateBody(toggleFavoriteSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { productId } = req.body as { productId: string };
    const result = await toggleFavoriteByUserId(req.user!._id.toString(), productId);
    res.json(result);
  }),
);

// DELETE /api/favorites
router.delete(
  "/",
  protect,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await clearFavoritesByUserId(req.user!._id.toString());
    res.json({ message: "Favorites cleared" });
  }),
);

export default router;
