import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IProduct } from "../types";
import axios from "axios";

export interface ShippingAddress {
  address: string;
  city: string;
  phoneNumber: string;
  postalCode: string;
  country: string;
}

interface CartItem extends Pick<
  IProduct,
  "_id" | "name" | "price" | "image" | "countInStock"
> {
  qty: number;
}

interface ServerCartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  countInStock: number;
  qty: number;
}

interface CartState {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  addItem: (product: IProduct, token: string) => void;
  removeItem: (id: string, token: string) => void;
  updateQty: (id: string, qty: number, token: string) => void;
  clearCart: (token?: string) => void;
  loadCartFromServer: (token: string) => Promise<void>;
  totalPrice: () => number;
  totalQty: () => number;
  saveShippingAddress: (address: ShippingAddress) => void;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";

const syncCartToServer = async (items: CartItem[], token: string) => {
  try {
    await axios.post(
      `${API_BASE_URL}/api/cart`,
      {
        items: items.map((i) => ({
          productId: i._id,
          name: i.name,
          image: i.image,
          price: i.price,
          countInStock: i.countInStock,
          qty: i.qty,
        })),
      },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch (err) {
    console.error("Failed to sync cart:", err);
  }
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      shippingAddress: {
        address: "",
        city: "",
        phoneNumber: "",
        postalCode: "",
        country: "",
      },

      addItem: (product, token) => {
        const exists = get().items.find((i) => i._id === product._id);
        let newItems: CartItem[];
        if (exists) {
          newItems = get().items.map((i) =>
            i._id === product._id && i.qty < product.countInStock
              ? { ...i, qty: i.qty + 1 }
              : i,
          );
        } else {
          const { _id, name, price, image, countInStock } = product;
          newItems = [
            ...get().items,
            { _id, name, price, image, countInStock, qty: 1 },
          ];
        }
        set({ items: newItems });
        syncCartToServer(newItems, token);
      },

      removeItem: (id, token) => {
        const newItems = get().items.filter((i) => i._id !== id);
        set({ items: newItems });
        syncCartToServer(newItems, token);
      },

      updateQty: (id, qty, token) => {
        const newItems = get().items.map((i) =>
          i._id === id ? { ...i, qty } : i,
        );
        set({ items: newItems });
        syncCartToServer(newItems, token);
      },

      clearCart: async (token?) => {
        set({ items: [] });
        if (token) {
          try {
            await axios.delete(`${API_BASE_URL}/api/cart`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (err) {
            console.error("Failed to clear cart on server:", err);
          }
        }
      },

      loadCartFromServer: async (token) => {
        try {
          const { data } = await axios.get(`${API_BASE_URL}/api/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const items: CartItem[] = data.map((i: ServerCartItem) => ({
            _id: i.productId,
            name: i.name,
            image: i.image,
            price: i.price,
            countInStock: i.countInStock,
            qty: i.qty,
          }));
          set({ items });
        } catch (err) {
          console.error("Failed to load cart from server:", err);
        }
      },

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      totalQty: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      saveShippingAddress: (data) => set({ shippingAddress: data }),
    }),
    { name: "cart" },
  ),
);
