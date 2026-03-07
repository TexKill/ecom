import { Types } from "mongoose";
import { User } from "../models/User";
import type { ICartItem } from "../types";
import { httpError } from "../utils/httpError";

type CartPayloadItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  countInStock: number;
  qty: number;
};

export const getCartByUserId = async (userId: string): Promise<ICartItem[]> => {
  const user = await User.findById(userId).select("cart").lean();
  if (!user) {
    throw httpError(404, "User not found");
  }
  return user.cart as ICartItem[];
};

export const syncCartByUserId = async (
  userId: string,
  items: CartPayloadItem[],
): Promise<ICartItem[]> => {
  const normalized = items.map((item) => ({
    ...item,
    productId: new Types.ObjectId(item.productId),
  }));

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { cart: normalized } },
    { returnDocument: "after" },
  ).select("cart");

  if (!user) {
    throw httpError(404, "User not found");
  }

  return user.cart as ICartItem[];
};

export const clearCartByUserId = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, { cart: [] });
};

