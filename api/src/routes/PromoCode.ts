import express, { Response } from "express";
import asyncHandler from "express-async-handler";
import { protect } from "../middleware/Auth";
import { admin } from "../middleware/Admin";
import { validateBody, validateParams, validateQuery } from "../middleware/Validate";
import { PromoCode } from "../models/PromoCode";
import {
  createPromoCodeSchema,
  promoCodeIdParamSchema,
  promoCodeQuerySchema,
  updatePromoCodeSchema,
} from "../validation/promoCode";
import { validatePromoCodeForSubtotal } from "../services/PromoCodeService";
import { AuthRequest } from "../types/auth";
import { httpError } from "../utils/httpError";

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
      promoCode: {
        _id: result.promoCode._id,
        code: result.promoCode.code,
        type: result.promoCode.type,
        value: result.promoCode.value,
        minOrderAmount: result.promoCode.minOrderAmount,
        isActive: result.promoCode.isActive,
        expiresAt: result.promoCode.expiresAt,
      },
    });
  }),
);

promoCodeRoute.get(
  "/",
  protect,
  admin,
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const promoCodes = await PromoCode.find({}).sort({ createdAt: -1 });
    res.json(promoCodes);
  }),
);

promoCodeRoute.post(
  "/",
  protect,
  admin,
  validateBody(createPromoCodeSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const code = String(req.body.code).trim().toUpperCase();
    const existing = await PromoCode.findOne({ code });
    if (existing) {
      throw httpError(409, "Promo code already exists");
    }

    const promoCode = await PromoCode.create({
      ...req.body,
      code,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : undefined,
    });
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
    const promoCode = await PromoCode.findById(String(req.params.id));
    if (!promoCode) {
      throw httpError(404, "Promo code not found");
    }

    if (req.body.code !== undefined) {
      promoCode.code = String(req.body.code).trim().toUpperCase();
    }
    if (req.body.type !== undefined) {
      promoCode.type = req.body.type;
    }
    if (req.body.value !== undefined) {
      promoCode.value = Number(req.body.value);
    }
    if (req.body.minOrderAmount !== undefined) {
      promoCode.minOrderAmount = Number(req.body.minOrderAmount);
    }
    if (req.body.isActive !== undefined) {
      promoCode.isActive = Boolean(req.body.isActive);
    }
    if (req.body.expiresAt !== undefined) {
      promoCode.expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : undefined;
    }

    await promoCode.save();
    res.json(promoCode);
  }),
);

promoCodeRoute.delete(
  "/:id",
  protect,
  admin,
  validateParams(promoCodeIdParamSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const promoCode = await PromoCode.findById(String(req.params.id));
    if (!promoCode) {
      throw httpError(404, "Promo code not found");
    }

    await promoCode.deleteOne();
    res.json({ message: "Promo code removed" });
  }),
);

export default promoCodeRoute;
