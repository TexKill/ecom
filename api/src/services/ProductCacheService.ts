import { buildCacheKey, deleteCacheByPattern, deleteCacheKey } from "../utils/cache";

export const PRODUCTS_PUBLIC_CACHE_CONTROL =
  "public, max-age=30, stale-while-revalidate=120";

export const buildProductListCacheKey = (queryKey: string) =>
  buildCacheKey("products", "list", queryKey);

export const buildProductFiltersCacheKey = () => buildCacheKey("products", "filters");

export const buildProductDetailsCacheKey = (productId: string) =>
  buildCacheKey("products", "detail", productId);

export const invalidateProductCaches = async (productId?: string) => {
  await deleteCacheByPattern(buildCacheKey("products", "list", "*"));
  await deleteCacheKey(buildProductFiltersCacheKey());

  if (productId) {
    await deleteCacheKey(buildProductDetailsCacheKey(productId));
    return;
  }

  await deleteCacheByPattern(buildCacheKey("products", "detail", "*"));
};
