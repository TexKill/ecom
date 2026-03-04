import { useQuery } from "@tanstack/react-query";
import { fetchProducts, ProductQueryParams } from "@/lib/api/products";
import { useProductFilters } from "@/store/useProductFilters";

export const useProducts = (keywordFromUrl: string = "") => {
  const filters = useProductFilters();

  const params: ProductQueryParams = {
    keyword: typeof keywordFromUrl === "string" ? keywordFromUrl : "",
    pageNumber: filters.pageNumber,
    pageSize: filters.pageSize,
    category: filters.category,
    brand: filters.brand,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sort: filters.sort,
  };

  return useQuery({
    queryKey: ["products", params],
    queryFn: () => fetchProducts(params),
    placeholderData: (prev) => prev,
  });
};
