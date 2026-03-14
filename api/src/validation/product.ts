import { z } from "zod";
import { objectIdSchema } from "./common";

const productImagesSchema = z
  .array(z.string().trim().min(1))
  .min(1)
  .transform((images) => images.map((image) => image.trim()));

export const productIdParamSchema = z.object({
  id: objectIdSchema,
});

export const productReviewParamsSchema = z.object({
  id: objectIdSchema,
  reviewId: objectIdSchema,
});

export const productListQuerySchema = z
  .object({
    pageSize: z.coerce.number().int().positive().max(100).optional(),
    pageNumber: z.coerce.number().int().positive().optional(),
    keyword: z.string().trim().max(200).optional(),
    brand: z.string().trim().max(500).optional(),
    category: z.string().trim().max(100).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),

    sort: z
      .enum(["newest", "price_asc", "price_desc", "rating_desc", "name_asc"])
      .optional(),
  })
  .refine(
    (data) =>
      data.minPrice == null ||
      data.maxPrice == null ||
      data.maxPrice >= data.minPrice,
    {
      message: "maxPrice must be greater than or equal to minPrice",
      path: ["maxPrice"],
    },
  );

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(300),
  price: z.number().nonnegative(),
  description: z.string().trim().min(2).max(5000),
  descriptionUk: z.string().trim().max(5000).optional(),
  descriptionEn: z.string().trim().max(5000).optional(),
  image: z.string().trim().min(1),
  images: productImagesSchema,
  brand: z.string().trim().min(1).max(150),
  category: z.string().trim().min(1).max(150),
  countInStock: z.number().int().nonnegative(),
});

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(2).max(300).optional(),
    price: z.number().nonnegative().optional(),
    description: z.string().trim().min(2).max(5000).optional(),
    descriptionUk: z.string().trim().max(5000).optional(),
    descriptionEn: z.string().trim().max(5000).optional(),
    image: z.string().trim().min(1).optional(),
    images: productImagesSchema.optional(),
    brand: z.string().trim().min(1).max(150).optional(),
    category: z.string().trim().min(1).max(150).optional(),
    countInStock: z.number().int().nonnegative().optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.price !== undefined ||
      data.description !== undefined ||
      data.descriptionUk !== undefined ||
      data.descriptionEn !== undefined ||
      data.image !== undefined ||
      data.images !== undefined ||
      data.brand !== undefined ||
      data.category !== undefined ||
      data.countInStock !== undefined,
    { message: "At least one field is required", path: ["body"] },
  );

export const createReviewSchema = z.object({
  rating: z.coerce.number().min(0).max(5),
  comment: z.string().trim().min(1).max(2000),
});
