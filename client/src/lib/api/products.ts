import { IProduct } from "@/types";
import { clientEnv } from "../env";

export interface ProductQueryParams {
  pageNumber?: number;
  pageSize?: number;
  keyword?: string;
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export interface ProductsResponse {
  products: IProduct[];
  page: number;
  pages: number;
  total: number;
}

const BASE_URL = clientEnv.NEXT_PUBLIC_API_URL;

const buildProductsUrl = (params: ProductQueryParams) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      typeof value !== "object"
    ) {
      query.append(key, String(value));
    }
  });

  return `${BASE_URL}/api/products?${query.toString()}`;
};

export const fetchProducts = async (
  params: ProductQueryParams,
  init?: RequestInit,
): Promise<ProductsResponse> => {
  const response = await fetch(buildProductsUrl(params), init);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  return response.json();
};

export const fetchProductById = async (
  id: string,
  init?: RequestInit,
): Promise<IProduct> => {
  const response = await fetch(`${BASE_URL}/api/products/${id}`, init);

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  return response.json();
};

export const fetchProductFilters = async () => {
  const response = await fetch(`${BASE_URL}/api/products/filters`);

  if (!response.ok) {
    throw new Error("Failed to fetch filters");
  }

  return response.json();
};
