import { Product } from "../models/Product";
import { httpError } from "../utils/httpError";
import { invalidateProductCaches } from "./ProductCacheService";

type ProductPayload = {
  name: string;
  price: number;
  description: string;
  descriptionUk?: string;
  descriptionEn?: string;
  longDescription?: string;
  longDescriptionUk?: string;
  longDescriptionEn?: string;
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
    longDescription:
      payload.longDescription ||
      payload.longDescriptionUk ||
      payload.longDescriptionEn ||
      payload.description,
    longDescriptionUk:
      payload.longDescriptionUk ||
      payload.longDescription ||
      payload.descriptionUk ||
      payload.description,
    longDescriptionEn:
      payload.longDescriptionEn ||
      payload.longDescription ||
      payload.descriptionEn ||
      payload.description,
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

  if (payload.longDescription === undefined) {
    if (payload.longDescriptionUk !== undefined || payload.longDescriptionEn !== undefined) {
      payload.longDescription =
        payload.longDescriptionUk ||
        payload.longDescriptionEn ||
        product.longDescription;
    } else if (payload.description !== undefined && !product.longDescription) {
      payload.longDescription = payload.description;
    }
  }

  if (payload.longDescriptionUk === undefined && payload.longDescription !== undefined) {
    payload.longDescriptionUk = payload.longDescription;
  }

  if (payload.longDescriptionEn === undefined && payload.longDescription !== undefined) {
    payload.longDescriptionEn = payload.longDescription;
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

const getNormalizedReviews = (product: { reviews?: any[] | null }) => {
  if (!Array.isArray(product.reviews)) {
    product.reviews = [];
  }

  return product.reviews;
};

export const addProductReview = async (args: {
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
}) => {
  const { productId, userId, userName, rating, comment } = args;
  const product = await Product.findById(productId).lean();
  if (!product) {
    throw httpError(404, "Product not found");
  }

  const reviews = getNormalizedReviews(product);
  const alreadyReviewed = reviews.find((r: { user: string }) => r.user.toString() === userId);
  if (alreadyReviewed) {
    throw httpError(400, "Product already reviewed");
  }

  reviews.push({
    name: userName.trim() || "Anonymous",
    rating: Number(rating),
    comment,
    user: userId as any,
  } as any);

  const numReviews = reviews.length;
  const averageRating =
    reviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) /
    reviews.length;

  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        reviews,
        numReviews,
        rating: averageRating,
      },
    },
  );
  await invalidateProductCaches(productId);
};

export const removeProductReview = async (productId: string, reviewId: string) => {
  const product = await Product.findById(productId).lean();
  if (!product) {
    throw httpError(404, "Product not found");
  }

  const reviews = getNormalizedReviews(product);
  const reviewIndex = reviews.findIndex((review: any) => review._id.toString() === reviewId);
  if (reviewIndex < 0) {
    throw httpError(404, "Review not found");
  }

  reviews.splice(reviewIndex, 1);
  const numReviews = reviews.length;
  const averageRating =
    reviews.length === 0
      ? 0
      : reviews.reduce((acc: number, review: { rating: number }) => acc + review.rating, 0) /
        reviews.length;

  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        reviews,
        numReviews,
        rating: averageRating,
      },
    },
  );
  await invalidateProductCaches(productId);
};
