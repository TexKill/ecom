import { z } from "zod";
import { objectIdSchema } from "./common";

export const createOrderSchema = z.object({
  orderItems: z
    .array(
      z.object({
        product: objectIdSchema,
        qty: z.number().int().positive(),
      }),
    )
    .min(1),
  shippingAddress: z.object({
    address: z.string().trim().min(2),
    city: z.string().trim().min(2),
    phoneNumber: z.string().trim().min(5).max(32),
    postalCode: z.string().trim().min(2),
    country: z.string().trim().min(2),
  }),
  paymentMethod: z.string().trim().min(2).max(50),
});

export const payOrderSchema = z.object({
  id: z.string().trim().min(1),
  status: z.string().trim().min(1),
  update_time: z.string().trim().min(1),
  email_address: z.string().trim().email(),
});

export const orderIdParamSchema = z.object({
  id: objectIdSchema,
});
