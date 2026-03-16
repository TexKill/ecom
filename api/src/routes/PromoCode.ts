import express, { Response } from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/Auth";
import { admin } from "../middleware/Admin";
import { validateBody, validateParams, validateQuery } from "../middleware/Validate";
import {
  createPromoCodeSchema,
  promoCodeIdParamSchema,
  promoCodeQuerySchema,
  updatePromoCodeSchema,
} from "../validation/promoCode";
import {
  createPromoCode,
  deletePromoCodeById,
  getPromoCodes,
  updatePromoCodeById,
  validatePromoCodeForSubtotal,
} from "../services/PromoCodeService";
import { AuthRequest } from "../types/auth";

const promoCodeRoute = express.Router();

promoCodeRoute.get(
  "/validate",
  protect,
  validateQuery(promoCodeQuerySchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { code, subtotal } = req.query as { code: string; subtotal: string };
    const result = await validatePromoCodeForSubtotal(code, Number(subtotal));

    res.json({
      valid: true,
      discountAmount: result.discountAmount,
      promoCode: result.promoCode,
    });
  }),
);

promoCodeRoute.get(
  "/",
  protect,
  admin,
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    res.json(await getPromoCodes());
  }),
);

promoCodeRoute.post(
  "/",
  protect,
  admin,
  validateBody(createPromoCodeSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const promoCode = await createPromoCode(req.body);
    res.status(201).json(promoCode);
  }),
);

promoCodeRoute.put(
  "/:id",
  protect,
  admin,
  validateParams(promoCodeIdParamSchema),
  validateBody(updatePromoCodeSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const promoCode = await updatePromoCodeById(String(req.params.id), req.body);
    res.json(promoCode);
  }),
);

promoCodeRoute.delete(
  "/:id",
  protect,
  admin,
  validateParams(promoCodeIdParamSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    await deletePromoCodeById(String(req.params.id));
    res.json({ message: "Promo code removed" });
  }),
);

export default promoCodeRoute;
