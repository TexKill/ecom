import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAuthCookies, clearAuthCookies } from "@/lib/cookies";

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

interface AuthState {
  user: User | null;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setUser: (user) => {
        setAuthCookies(user.token, user.isAdmin);
        set({ user });
      },
      logout: () => {
        clearAuthCookies();
        set({ user: null });
      },
    }),
    {
      name: "auth",
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          setAuthCookies(state.user.token, state.user.isAdmin);
        } else {
          clearAuthCookies();
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);
