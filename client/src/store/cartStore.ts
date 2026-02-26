import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IProduct } from "../types";

interface CartItem extends Pick<
  IProduct,
  "_id" | "name" | "price" | "image" | "countInStock"
> {
  qty: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: IProduct) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalQty: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const exists = get().items.find((i) => i._id === product._id);
        if (exists) {
          set({
            items: get().items.map((i) =>
              i._id === product._id && i.qty < product.countInStock
                ? { ...i, qty: i.qty + 1 }
                : i,
            ),
          });
        } else {
          const { _id, name, price, image, countInStock } = product;
          set({
            items: [
              ...get().items,
              { _id, name, price, image, countInStock, qty: 1 },
            ],
          });
        }
      },
      removeItem: (id) =>
        set({ items: get().items.filter((i) => i._id !== id) }),
      updateQty: (id, qty) =>
        set({
          items: get().items.map((i) => (i._id === id ? { ...i, qty } : i)),
        }),
      clearCart: () => set({ items: [] }),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
      totalQty: () => get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    { name: "cart" },
  ),
);
