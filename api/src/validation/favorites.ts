import { z } from "zod";
import { objectIdSchema } from "./common";

export const toggleFavoriteSchema = z.object({
  productId: objectIdSchema,
});
