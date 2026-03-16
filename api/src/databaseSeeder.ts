import express, { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { Product } from "./models/Product";
import users from "./data/Users";
import products from "./data/Products";
import { env } from "./config/env";
import { prisma } from "./db/commerce";
import { generateDbId } from "./utils/ids";

const router = express.Router();

router.use((req: Request, res: Response, next) => {
  const seedKey = env.SEED_KEY;
  const providedKey = req.header("x-seed-key");

  if (!seedKey || providedKey !== seedKey) {
    res.status(403);
    throw new Error("Seeder access denied");
  }

  next();
});

router.post(
  "/users",
  asyncHandler(async (_req: Request, res: Response) => {
    await prisma.$transaction([
      prisma.paymentLog.deleteMany(),
      prisma.cartItem.deleteMany(),
      prisma.favoriteItem.deleteMany(),
      prisma.order.deleteMany(),
      prisma.user.deleteMany(),
    ]);

    const payload = users.map((user) => ({
      id: generateDbId(),
      ...user,
    }));

    await prisma.user.createMany({ data: payload });
    const UserSeeder = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
    res.send({ UserSeeder });
  }),
);

router.post(
  "/products",
  asyncHandler(async (_req: Request, res: Response) => {
    await Product.deleteMany({});

    const adminUser = await prisma.user.findFirst({ where: { isAdmin: true } });

    if (!adminUser) {
      res.status(400);
      throw new Error("Run POST /api/seed/users first");
    }

    const productsWithUser = products.map((product) => ({
      ...product,
      user: adminUser.id,
    }));

    const ProductSeeder = await Product.insertMany(productsWithUser);
    res.send({ ProductSeeder });
  }),
);

export default router;
