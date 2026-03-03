import { useQuery } from "@tanstack/react-query";
import { fetchProducts, ProductQueryParams } from "@/lib/api/products";

export const useProducts = (params: ProductQueryParams) => {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => fetchProducts(params),
    placeholderData: (prev) => prev,
  });
};
