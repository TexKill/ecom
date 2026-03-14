import { z } from "zod";
import { objectIdSchema } from "./common";

const promoCodeTypeSchema = z.enum(["percent", "fixed"]);
const promoDateSchema = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: "Invalid date",
  });

export const promoCodeIdParamSchema = z.object({
  id: objectIdSchema,
});

export const promoCodeQuerySchema = z.object({
  code: z.string().trim().min(1).max(50),
  subtotal: z.coerce.number().nonnegative(),
});

export const createPromoCodeSchema = z.object({
  code: z.string().trim().min(2).max(50),
  type: promoCodeTypeSchema,
  value: z.number().positive(),
  minOrderAmount: z.number().nonnegative().default(0),
  isActive: z.boolean().optional().default(true),
  expiresAt: promoDateSchema.optional(),
});

export const updatePromoCodeSchema = z
  .object({
    code: z.string().trim().min(2).max(50).optional(),
    type: promoCodeTypeSchema.optional(),
    value: z.number().positive().optional(),
    minOrderAmount: z.number().nonnegative().optional(),
    isActive: z.boolean().optional(),
    expiresAt: promoDateSchema.nullable().optional(),
  })
  .refine(
    (data) =>
      data.code !== undefined ||
      data.type !== undefined ||
      data.value !== undefined ||
      data.minOrderAmount !== undefined ||
      data.isActive !== undefined ||
      data.expiresAt !== undefined,
    { message: "At least one field is required", path: ["body"] },
  );
