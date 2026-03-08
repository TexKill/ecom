import express, { Response } from "express";
import { AuthRequest } from "../types/auth";
import asyncHandler from "express-async-handler";
import { Product } from "../models/Product";
import { protect } from "../middleware/Auth";
import { admin } from "../middleware/Admin";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/Validate";
import {
  createProductSchema,
  createReviewSchema,
  productIdParamSchema,
  productReviewParamsSchema,
  productListQuerySchema,
  updateProductSchema,
} from "../validation/product";
import {
  getCachedJson,
  setCachedJson,
} from "../utils/cache";
import {
  buildProductDetailsCacheKey,
  buildProductFiltersCacheKey,
  buildProductListCacheKey,
  PRODUCTS_PUBLIC_CACHE_CONTROL,
} from "../services/ProductCacheService";
import {
  addProductReview,
  createProduct,
  deleteProduct,
  removeProductReview,
  restockRandomProducts,
  updateProduct,
} from "../services/ProductService";

const productRoute = express.Router();

const serializeListQuery = (query: Record<string, unknown>) => {
  const pairs = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));

  if (pairs.length === 0) {
    return "default";
  }

  return pairs.map(([key, value]) => `${key}=${String(value)}`).join("&");
};

/* ======================================================
   @desc   Get all products (search + filters + pagination + sorting)
   @route  GET /api/products
   @access Public
====================================================== */
productRoute.get(
  "/",
  validateQuery(productListQuerySchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      pageSize = 8,
      pageNumber = 1,
      keyword,
      brand,
      category,
      minPrice,
      maxPrice,
      sort,
    } = req.query as any;

    const listCacheKey = buildProductListCacheKey(
      serializeListQuery(req.query as Record<string, unknown>),
    );
    const cachedPayload = await getCachedJson<{
      products: unknown[];
      page: number;
      pages: number;
      total: number;
    }>(listCacheKey);

    if (cachedPayload) {
      res.set("Cache-Control", PRODUCTS_PUBLIC_CACHE_CONTROL);
      res.json(cachedPayload);
      return;
    }

    const limit = Number(pageSize);
    const page = Number(pageNumber);

    const filter: any = {};

    // Search
    if (keyword) {
      filter.name = { $regex: keyword, $options: "i" };
    }

    // Brand filter
    if (brand) {
      filter.brand = { $in: (brand as string).split(",") };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }

    // Sort (newest)
    let sortOption: any = { createdAt: -1 };

    if (sort) {
      switch (sort) {
        case "price_asc":
          sortOption = { price: 1 };
          break;
        case "price_desc":
          sortOption = { price: -1 };
          break;
        case "rating_desc":
          sortOption = { rating: -1 };
          break;
        case "name_asc":
          sortOption = { name: 1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    }

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortOption)
      .limit(limit)
      .skip(limit * (page - 1))
      .lean();

    const responsePayload = {
      products,
      page,
      pages: Math.ceil(count / limit),
      total: count,
    };

    await setCachedJson(listCacheKey, responsePayload);
    res.set("Cache-Control", PRODUCTS_PUBLIC_CACHE_CONTROL);
    res.json(responsePayload);
  }),
);

/* ======================================================
   @desc   Get product filter metadata (unique values for UI)
   @route  GET /api/products/filters
   @access Public
====================================================== */
productRoute.get(
  "/filters",
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const filtersCacheKey = buildProductFiltersCacheKey();
    const cachedPayload = await getCachedJson<{
      brands: string[];
      categories: string[];
      priceRange: { min: number; max: number };
    }>(filtersCacheKey);

    if (cachedPayload) {
      res.set("Cache-Control", PRODUCTS_PUBLIC_CACHE_CONTROL);
      res.json(cachedPayload);
      return;
    }

    const brands = await Product.distinct("brand");
    const categories = await Product.distinct("category");

    const priceStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    const priceRange =
      priceStats.length > 0
        ? {
            min: priceStats[0].minPrice,
            max: priceStats[0].maxPrice,
          }
        : { min: 0, max: 0 };

    const responsePayload = {
      brands,
      categories,
      priceRange,
    };

    await setCachedJson(filtersCacheKey, responsePayload);
    res.set("Cache-Control", PRODUCTS_PUBLIC_CACHE_CONTROL);
    res.json(responsePayload);
  }),
);

/* ======================================================
   @desc   Get single product
   @route  GET /api/products/:id
   @access Public
====================================================== */
productRoute.get(
  "/:id",
  validateParams(productIdParamSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const productId = String(req.params.id);
    const detailsCacheKey = buildProductDetailsCacheKey(productId);
    const cachedProduct = await getCachedJson<unknown>(detailsCacheKey);

    if (cachedProduct) {
      res.set("Cache-Control", PRODUCTS_PUBLIC_CACHE_CONTROL);
      res.json(cachedProduct);
      return;
    }

    const product = await Product.findById(productId).lean();

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    await setCachedJson(detailsCacheKey, product);
    res.set("Cache-Control", PRODUCTS_PUBLIC_CACHE_CONTROL);
    res.json(product);
  }),
);

/* ======================================================
   @desc   Create product
   @route  POST /api/products
   @access Admin
====================================================== */
productRoute.post(
  "/",
  protect,
  admin,
  validateBody(createProductSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const createdProduct = await createProduct(String(req.user?._id), req.body);
    res.status(201).json(createdProduct);
  }),
);

/* ======================================================
   @desc   Update product
   @route  PUT /api/products/:id
   @access Admin
====================================================== */
productRoute.put(
  "/:id",
  protect,
  admin,
  validateParams(productIdParamSchema),
  validateBody(updateProductSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const productId = String(req.params.id);
    const updatedProduct = await updateProduct(productId, req.body);
    res.json(updatedProduct);
  }),
);

/* ======================================================
   @desc   Delete product
   @route  DELETE /api/products/:id
   @access Admin
====================================================== */
productRoute.delete(
  "/:id",
  protect,
  admin,
  validateParams(productIdParamSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const productId = String(req.params.id);
    await deleteProduct(productId);
    res.json({ message: "Product removed" });
  }),
);

/* ======================================================
   @desc   Random restock all products (1..100)
   @route  POST /api/products/restock-random
   @access Admin
====================================================== */
productRoute.post(
  "/restock-random",
  protect,
  admin,
  asyncHandler(async (_req: AuthRequest, res: Response) => {
    const updatedCount = await restockRandomProducts();
    res.json({
      message: `Random restock complete: ${updatedCount} products updated`,
      updatedCount,
    });
  }),
);

/* ======================================================
   @desc   Create review
   @route  POST /api/products/:id/reviews
   @access Private
====================================================== */
productRoute.post(
  "/:id/reviews",
  protect,
  validateParams(productIdParamSchema),
  validateBody(createReviewSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const productId = String(req.params.id);
    await addProductReview({
      productId,
      userId: String(req.user?._id),
      userName: String(req.user?.name || ""),
      rating: Number(req.body.rating),
      comment: String(req.body.comment),
    });
    res.status(201).json({ message: "Review added" });
  }),
);

/* ======================================================
   @desc   Delete review
   @route  DELETE /api/products/:id/reviews/:reviewId
   @access Admin
====================================================== */
productRoute.delete(
  "/:id/reviews/:reviewId",
  protect,
  admin,
  validateParams(productReviewParamsSchema),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id, reviewId } = req.params as { id: string; reviewId: string };
    await removeProductReview(id, reviewId);
    res.json({ message: "Review removed" });
  }),
);

export default productRoute;
