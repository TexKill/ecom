import { prisma } from "../db/commerce";
import { Product } from "../models/Product";
import type { IFavoriteItem } from "../types";
import { httpError } from "../utils/httpError";
import { toApiFavoriteItem } from "../utils/commerceSerializers";
import { generateDbId } from "../utils/ids";

export const getFavoritesByUserId = async (userId: string): Promise<IFavoriteItem[]> => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) {
    throw httpError(404, "User not found");
  }

  const items = await prisma.favoriteItem.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return items.map(toApiFavoriteItem);
};

export const toggleFavoriteByUserId = async (
  userId: string,
  productId: string,
): Promise<{ action: "added" | "removed"; items: IFavoriteItem[] }> => {
  const [product, user, existing] = await Promise.all([
    Product.findById(productId).select("_id name image price countInStock"),
    prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
    prisma.favoriteItem.findFirst({ where: { userId, productId } }),
  ]);

  if (!product) {
    throw httpError(404, "Product not found");
  }

  if (!user) {
    throw httpError(404, "User not found");
  }

  if (existing) {
    await prisma.favoriteItem.delete({ where: { id: existing.id } });
    const items = await prisma.favoriteItem.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    return { action: "removed", items: items.map(toApiFavoriteItem) };
  }

  await prisma.favoriteItem.create({
    data: {
      id: generateDbId(),
      userId,
      productId,
      name: product.name,
      image: product.image,
      price: product.price,
      countInStock: product.countInStock,
    },
  });

  const items = await prisma.favoriteItem.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return { action: "added", items: items.map(toApiFavoriteItem) };
};

export const clearFavoritesByUserId = async (userId: string): Promise<void> => {
  await prisma.favoriteItem.deleteMany({ where: { userId } });
};
