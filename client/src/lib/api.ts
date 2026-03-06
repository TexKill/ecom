import axiosInstance from "./axios";
import { IProduct, IUser, IOrder, OrderStatus } from "../types";

export const loginUser = async (email: string, password: string) => {
  const { data } = await axiosInstance.post<IUser & { token: string }>(
    "/api/users/login",
    { email, password },
  );
  return data;
};

export const registerUser = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string,
) => {
  const { data } = await axiosInstance.post<IUser & { token: string }>(
    "/api/users/register",
    { firstName, lastName, email, password },
  );
  return data;
};

export const getUserProfile = async () => {
  const { data } = await axiosInstance.get<IUser>("/api/users/profile");
  return data;
};

export const getProducts = async (
  keyword = "",
  pageNumber = 1,
  pageSize = 8,
  // Add a filter object
  filters?: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  },
) => {
  // Using URLSearchParams for clean query construction
  const params = new URLSearchParams({
    keyword,
    pageNumber: String(pageNumber),
    pageSize: String(pageSize),
  });

  // Add filters only if they exist
  if (filters?.category) params.set("category", filters.category);
  if (filters?.brand) params.set("brand", filters.brand);
  if (filters?.minPrice !== undefined)
    params.set("minPrice", String(filters.minPrice));
  if (filters?.maxPrice !== undefined)
    params.set("maxPrice", String(filters.maxPrice));
  if (filters?.sort) params.set("sort", filters.sort);

  const { data } = await axiosInstance.get(
    `/api/products?${params.toString()}`,
  );
  return data;
};

export const getProductById = async (id: string) => {
  const { data } = await axiosInstance.get<IProduct>(`/api/products/${id}`);
  return data;
};

export const createProductReview = async (
  productId: string,
  payload: { rating: number; comment: string },
) => {
  const { data } = await axiosInstance.post<{ message: string }>(
    `/api/products/${productId}/reviews`,
    payload,
  );
  return data;
};

export const deleteProductReview = async (
  productId: string,
  reviewId: string,
) => {
  const { data } = await axiosInstance.delete<{ message: string }>(
    `/api/products/${productId}/reviews/${reviewId}`,
  );
  return data;
};

export const createOrder = async (orderData: Partial<IOrder>) => {
  const { data } = await axiosInstance.post<IOrder>("/api/orders", orderData);
  return data;
};

export const getMyOrders = async () => {
  const { data } = await axiosInstance.get<IOrder[]>("/api/orders/myorders");
  return data;
};

export const getOrderById = async (id: string) => {
  const { data } = await axiosInstance.get<IOrder>(`/api/orders/${id}`);
  return data;
};

// Admin Orders
export const getAllOrders = async (
  page = 1,
): Promise<{ orders: IOrder[]; pages: number; page: number }> => {
  const { data } = await axiosInstance.get(`/api/orders?page=${page}`);
  return data;
};

export const markOrderDelivered = async (id: string) => {
  const { data } = await axiosInstance.put<IOrder>(`/api/orders/${id}/deliver`);
  return data;
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
  const { data } = await axiosInstance.put<IOrder>(`/api/orders/${id}/status`, {
    status,
  });
  return data;
};

export const deleteOrder = async (id: string) => {
  const { data } = await axiosInstance.delete<{ message: string }>(
    `/api/orders/${id}`,
  );
  return data;
};

// Admin Products
export type ProductPayload = {
  name: string;
  price: number;
  description: string;
  descriptionUk?: string;
  descriptionEn?: string;
  image: string;
  brand: string;
  category: string;
  countInStock: number;
};

export const createProduct = async (payload: ProductPayload) => {
  const { data } = await axiosInstance.post<IProduct>("/api/products", payload);
  return data;
};

export const updateProduct = async (
  id: string,
  payload: Partial<ProductPayload>,
) => {
  const { data } = await axiosInstance.put<IProduct>(
    `/api/products/${id}`,
    payload,
  );
  return data;
};

export const deleteProduct = async (id: string) => {
  const { data } = await axiosInstance.delete<{ message: string }>(
    `/api/products/${id}`,
  );
  return data;
};

export const restockProductsRandom = async () => {
  const { data } = await axiosInstance.post<{
    message: string;
    updatedCount: number;
  }>("/api/products/restock-random");
  return data;
};

export const uploadProductImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await axiosInstance.post<{ url: string }>(
    "/api/upload",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  return data.url;
};
