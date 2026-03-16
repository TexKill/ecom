import { prisma } from "../db/commerce";
import type { ICartItem } from "../types";
import { httpError } from "../utils/httpError";
import { toApiCartItem } from "../utils/commerceSerializers";
import { generateDbId } from "../utils/ids";

type CartPayloadItem = ICartItem;

export const getCartByUserId = async (userId: string): Promise<ICartItem[]> => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) {
    throw httpError(404, "User not found");
  }

  const items = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return items.map(toApiCartItem);
};

export const syncCartByUserId = async (
  userId: string,
  items: CartPayloadItem[],
): Promise<ICartItem[]> => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) {
    throw httpError(404, "User not found");
  }

  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { userId } }),
    ...items.map((item) =>
      prisma.cartItem.create({
        data: {
          id: generateDbId(),
          userId,
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          countInStock: item.countInStock,
          qty: item.qty,
        },
      }),
    ),
  ]);

  const nextItems = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return nextItems.map(toApiCartItem);
};

export const clearCartByUserId = async (userId: string): Promise<void> => {
  await prisma.cartItem.deleteMany({ where: { userId } });
};
