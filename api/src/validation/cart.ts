import { z } from "zod";
import { objectIdSchema } from "./common";

export const syncCartSchema = z.object({
  items: z.array(
    z.object({
      productId: objectIdSchema,
      name: z.string().trim().min(1).max(300),
      image: z.string().trim().optional().default(""),
      price: z.number().nonnegative(),
      countInStock: z.number().int().nonnegative(),
      qty: z.number().int().positive(),
    }),
  ),
});
