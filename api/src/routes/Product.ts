import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Product } from "../models/Product";
import { protect } from "../middleware/Auth";
import { admin } from "../middleware/Admin";

const productRoute = express.Router();

// @desc   Get all products with search & pagination
// @route  GET /api/products
// @access Public
productRoute.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const pageSize = Number(req.query.pageSize) || 8;
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword as string, $options: "i" } }
      : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  }),
);

// @desc   Get single product by ID
// @route  GET /api/products/:id
// @access Public
productRoute.get(
  "/:id",
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
  asyncHandler(async (req: Request, res: Response) => {
    const { name, price, description, image, brand, category, countInStock } =
      req.body;

    const product = new Product({
      name,
      price,
      description,
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
  asyncHandler(async (req: Request, res: Response) => {
    const { name, price, description, image, brand, category, countInStock } =
      req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.brand = brand || product.brand;
      product.category = category || product.category;
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

export default productRoute;
