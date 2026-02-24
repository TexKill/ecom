import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { User } from "./models/User";
import { Product } from "./models/Product";
import users from "./data/Users";
import products from "./data/Products";

const router = express.Router();

// @desc  Seed Users
// @route POST /api/seed/users
router.post(
  "/users",
  asyncHandler(async (req: Request, res: Response) => {
    await User.deleteMany({});
    const UserSeeder = await User.insertMany(users);
    res.send({ UserSeeder });
  }),
);

// @desc  Seed Products
// @route POST /api/seed/products
router.post(
  "/products",
  asyncHandler(async (req: Request, res: Response) => {
    await Product.deleteMany({});
    const ProductSeeder = await Product.insertMany(products);
    res.send({ ProductSeeder });
  }),
);

export default router;
