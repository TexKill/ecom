import express, { Request, Response } from "express";
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

// @desc   Get all products with search & pagination
// @route  GET /api/products
// @access Public
productRoute.get(
  "/",
  validateQuery(productListQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { pageSize, pageNumber, keyword } = req.query as {
      pageSize?: string;
      pageNumber?: string;
      keyword?: string;
    };

    const limit = pageSize ? Number(pageSize) : 8;
    const page = pageNumber ? Number(pageNumber) : 1;
    const filter = keyword
      ? { name: { $regex: keyword, $options: "i" } }
      : {};

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
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

// @desc   Get single product by ID
// @route  GET /api/products/:id
// @access Public
productRoute.get(
  "/:id",
  validateParams(productIdParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  }),
);

// @desc   Create a product
// @route  POST /api/products
// @access Admin
productRoute.post(
  "/",
  protect,
  admin,
  validateBody(createProductSchema),
  asyncHandler(async (req: Request, res: Response) => {
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

// @desc   Update a product
// @route  PUT /api/products/:id
// @access Admin
productRoute.put(
  "/:id",
  protect,
  admin,
  validateParams(productIdParamSchema),
  validateBody(updateProductSchema),
  asyncHandler(async (req: Request, res: Response) => {
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

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name ?? product.name;
      product.price = price ?? product.price;
      product.description = description ?? product.description;
      product.descriptionUk = descriptionUk ?? product.descriptionUk;
      product.descriptionEn = descriptionEn ?? product.descriptionEn;
      product.image = image ?? product.image;
      product.brand = brand ?? product.brand;
      product.category = category ?? product.category;
      product.countInStock = countInStock ?? product.countInStock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  }),
);

// @desc   Delete a product
// @route  DELETE /api/products/:id
// @access Admin
productRoute.delete(
  "/:id",
  protect,
  admin,
  validateParams(productIdParamSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  }),
);

// @desc   Create a review
// @route  POST /api/products/:id/reviews
// @access Private
productRoute.post(
  "/:id/reviews",
  protect,
  validateParams(productIdParamSchema),
  validateBody(createReviewSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user?._id.toString(),
      );

      if (alreadyReviewed) {
        res.status(400);
        throw new Error("Product already reviewed");
      }

      const review = {
        name: req.user?.name as string,
        rating: Number(rating),
        comment,
        user: req.user?._id,
      };

      product.reviews.push(review as any);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, r) => acc + r.rating, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  }),
);

// @desc   Delete a review
// @route  DELETE /api/products/:id/reviews/:reviewId
// @access Admin
productRoute.delete(
  "/:id/reviews/:reviewId",
  protect,
  admin,
  validateParams(productReviewParamsSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const { id, reviewId } = req.params as { id: string; reviewId: string };
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
