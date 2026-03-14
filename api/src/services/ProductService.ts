import { Product } from "../models/Product";
import { httpError } from "../utils/httpError";
import { invalidateProductCaches } from "./ProductCacheService";

type ProductPayload = {
  name: string;
  price: number;
  description: string;
  descriptionUk?: string;
  descriptionEn?: string;
  image: string;
  images: string[];
  brand: string;
  category: string;
  countInStock: number;
};

export const createProduct = async (userId: string, payload: ProductPayload) => {
  const images = payload.images?.length ? payload.images : [payload.image];

  const product = new Product({
    ...payload,
    image: images[0],
    images,
    descriptionUk: payload.descriptionUk || payload.description,
    descriptionEn: payload.descriptionEn || payload.description,
    user: userId,
    rating: 0,
    numReviews: 0,
  });

  const createdProduct = await product.save();
  await invalidateProductCaches(createdProduct._id.toString());
  return createdProduct;
};

export const updateProduct = async (productId: string, payload: Partial<ProductPayload>) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw httpError(404, "Product not found");
  }

  if (payload.images) {
    payload.image = payload.images[0];
  }

  Object.assign(product, payload);
  const updatedProduct = await product.save();
  await invalidateProductCaches(productId);
  return updatedProduct;
};

export const deleteProduct = async (productId: string) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw httpError(404, "Product not found");
  }

  await product.deleteOne();
  await invalidateProductCaches(productId);
};

export const restockRandomProducts = async () => {
  const products = await Product.find({}, "_id").lean();
  if (products.length === 0) {
    return 0;
  }

  const ops = products.map((product) => ({
    updateOne: {
      filter: { _id: product._id },
      update: { $set: { countInStock: Math.floor(Math.random() * 100) + 1 } },
    },
  }));

  await Product.bulkWrite(ops);
  const updatedCount = products.length;
  await invalidateProductCaches();
  return updatedCount;
};

export const addProductReview = async (args: {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}) => {
  const { productId, userId, userName, rating, comment } = args;
  const product = await Product.findById(productId);
  if (!product) {
    throw httpError(404, "Product not found");
  }

  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === userId);
  if (alreadyReviewed) {
    throw httpError(400, "Product already reviewed");
  }

  product.reviews.push({
    name: userName,
    rating: Number(rating),
    comment,
    user: userId as any,
  } as any);

  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length;

  await product.save();
  await invalidateProductCaches(productId);
};

export const removeProductReview = async (productId: string, reviewId: string) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw httpError(404, "Product not found");
  }

  const reviewIndex = product.reviews.findIndex((review: any) => review._id.toString() === reviewId);
  if (reviewIndex < 0) {
    throw httpError(404, "Review not found");
  }

  product.reviews.splice(reviewIndex, 1);
  product.numReviews = product.reviews.length;
  product.rating =
    product.reviews.length === 0
      ? 0
      : product.reviews.reduce((acc, review) => acc + review.rating, 0) /
        product.reviews.length;

  await product.save();
  await invalidateProductCaches(productId);
};
