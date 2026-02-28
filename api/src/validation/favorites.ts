import { z } from "zod";

export const toggleFavoriteSchema = z.object({
  productId: z.string().trim().min(1),
});
