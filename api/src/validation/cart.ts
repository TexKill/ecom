import { z } from "zod";

export const syncCartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().trim().min(1),
      name: z.string().trim().min(1).max(300),
      image: z.string().trim().optional().default(""),
      price: z.number().nonnegative(),
      countInStock: z.number().int().nonnegative(),
      qty: z.number().int().positive(),
    }),
  ),
});
