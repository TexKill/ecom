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

const productRoute = express.Router();

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
      pageSize,
      pageNumber,
      keyword,
      brand,
      category,
      minPrice,
      maxPrice,
      sort,
    } = req.query as {
      pageSize?: string;
      pageNumber?: string;
      keyword?: string;
      brand?: string;
      category?: string;
      minPrice?: string;
      maxPrice?: string;
      sort?: string;
    };

    const limit = pageSize ? Number(pageSize) : 8;
    const page = pageNumber ? Number(pageNumber) : 1;

    const filter: any = {};

    // Search
    if (keyword) {
      filter.name = { $regex: keyword, $options: "i" };
    }

    // Brand filter (Apple,Samsung)
    if (brand) {
      filter.brand = { $in: brand.split(",") };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {
        ...(minPrice && { $gte: Number(minPrice) }),
        ...(maxPrice && { $lte: Number(maxPrice) }),
      };
    }

    // Sorting
    let sortOption: any = { createdAt: -1 }; // default: newest

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
      }
    }

    const count = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort(sortOption)
      .limit(limit)
      .skip(limit * (page - 1));

    res.json({
      products,
      page,
      pages: Math.ceil(count / limit),
      total: count,
    });
  }),
);

/* ======================================================
   @desc   Get product filter metadata
   @route  GET /api/products/filters
   @access Public
====================================================== */
productRoute.get(
  "/filters",
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Get all unique brands
    const brands = await Product.distinct("brand");

    // Get all unique categories
    const categories = await Product.distinct("category");

    // Get min & max price
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

    res.json({
      brands,
      categories,
      priceRange,
    });
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
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

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
    const {
      name,
      price,
      description,
      descriptionUk,
      descriptionEn,
      image,
      brand,
      category,
      countInStock,
    } = req.body;

    const product = new Product({
      name,
      price,
      description,
      descriptionUk: descriptionUk || description,
      descriptionEn: descriptionEn || description,
      image,
      brand,
      category,
      countInStock,
      user: req.user?._id,
      rating: 0,
      numReviews: 0,
    });

    const createdProduct = await product.save();
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
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    Object.assign(product, {
      ...product.toObject(),
      ...req.body,
    });

    const updatedProduct = await product.save();
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
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    await product.deleteOne();
    res.json({ message: "Product removed" });
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
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user?._id.toString(),
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error("Product already reviewed");
    }

    product.reviews.push({
      name: req.user?.name as string,
      rating: Number(rating),
      comment,
      user: req.user?._id,
    } as any);

    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length;

    await product.save();
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
    const { id, reviewId } = req.params as {
      id: string;
      reviewId: string;
    };

    const product = await Product.findById(id);

    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const reviewIndex = product.reviews.findIndex(
      (r: any) => r._id.toString() === reviewId,
    );

    if (reviewIndex < 0) {
      res.status(404);
      throw new Error("Review not found");
    }

    product.reviews.splice(reviewIndex, 1);

    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.length === 0
        ? 0
        : product.reviews.reduce((acc, r) => acc + r.rating, 0) /
          product.reviews.length;

    await product.save();

    res.json({ message: "Review removed" });
  }),
);

export default productRoute;
