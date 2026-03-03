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

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

export const fetchProducts = async (params: ProductQueryParams) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([Key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(Key, String(value));
    }
  });

  const response = await fetch(`${BASE_URL}/api/products?${query.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch products");
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
