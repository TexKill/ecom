import axiosInstance from "./axios";
import { IProduct, IUser, IOrder } from "../types";

// ─── Auth ─────────────────────────────────────────────────
export const loginUser = async (email: string, password: string) => {
  const { data } = await axiosInstance.post<IUser & { token: string }>(
    "/api/users/login",
    { email, password },
  );
  return data;
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
) => {
  const { data } = await axiosInstance.post<IUser & { token: string }>(
    "/api/users/register",
    { name, email, password },
  );
  return data;
};

export const getUserProfile = async () => {
  const { data } = await axiosInstance.get<IUser>("/api/users/profile");
  return data;
};

// ─── Products ─────────────────────────────────────────────
export const getProducts = async (keyword = "", pageNumber = 1) => {
  const { data } = await axiosInstance.get<{
    products: IProduct[];
    page: number;
    pages: number;
    total: number;
  }>(`/api/products?keyword=${keyword}&pageNumber=${pageNumber}`);
  return data;
};

export const getProductById = async (id: string) => {
  const { data } = await axiosInstance.get<IProduct>(`/api/products/${id}`);
  return data;
};

// ─── Orders ───────────────────────────────────────────────
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
