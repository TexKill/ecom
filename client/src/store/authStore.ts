import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IUser } from "../types";

interface AuthState {
  user: (IUser & { token: string }) | null;
  login: (user: IUser & { token: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: "user" }, // localStorage key name
  ),
);
