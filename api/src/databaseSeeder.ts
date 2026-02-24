import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { User } from "./models/User";
import { Product } from "./models/Product";
import users from "./data/Users";
import products from "./data/Products";

const router = express.Router();

// @route POST /api/seed/users
router.post(
  "/users",
  asyncHandler(async (req: Request, res: Response) => {
    await User.deleteMany({});
    const UserSeeder = await User.insertMany(users);
    res.send({ UserSeeder });
  }),
);

// @route POST /api/seed/products
router.post(
  "/products",
  asyncHandler(async (req: Request, res: Response) => {
    await Product.deleteMany({});

    // Знаходимо адміна з БД
    const adminUser = await User.findOne({ isAdmin: true });

    if (!adminUser) {
      res.status(400);
      throw new Error("Спочатку запустіть POST /api/seed/users");
    }

    // user for each product
    const productsWithUser = products.map((p) => ({
      ...p,
      user: adminUser._id,
    }));

    const ProductSeeder = await Product.insertMany(productsWithUser);
    res.send({ ProductSeeder });
  }),
);

export default router;
