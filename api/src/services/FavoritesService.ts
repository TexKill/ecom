import { User } from "../models/User";
import { Product } from "../models/Product";
import type { IFavoriteItem } from "../types";
import { httpError } from "../utils/httpError";

export const getFavoritesByUserId = async (userId: string): Promise<IFavoriteItem[]> => {
  const user = await User.findById(userId).select("favorites").lean();
  if (!user) {
    throw httpError(404, "User not found");
  }
  return (user.favorites || []) as IFavoriteItem[];
};

export const toggleFavoriteByUserId = async (
  userId: string,
  productId: string,
): Promise<{ action: "added" | "removed"; items: IFavoriteItem[] }> => {
  const product = await Product.findById(productId).select(
    "_id name image price countInStock",
  );
  if (!product) {
    throw httpError(404, "Product not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw httpError(404, "User not found");
  }

  const existingIndex = user.favorites.findIndex(
    (item) => item.productId.toString() === productId,
  );

  if (existingIndex >= 0) {
    user.favorites.splice(existingIndex, 1);
    await user.save();
    return { action: "removed", items: user.favorites as IFavoriteItem[] };
  }

  user.favorites.push({
    productId: product._id,
    name: product.name,
    image: product.image,
    price: product.price,
    countInStock: product.countInStock,
  } as any);

  await user.save();
  return { action: "added", items: user.favorites as IFavoriteItem[] };
};

export const clearFavoritesByUserId = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, { favorites: [] });
};

