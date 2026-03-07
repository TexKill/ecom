import { create } from "zustand";
import { persist } from "zustand/middleware";

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

const setAuthCookies = (user: User) => {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 30;
  document.cookie = `auth_token=${encodeURIComponent(user.token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  document.cookie = `auth_is_admin=${user.isAdmin ? "1" : "0"}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
};

const clearAuthCookies = () => {
  if (typeof document === "undefined") return;
  document.cookie = "auth_token=; Path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "auth_is_admin=; Path=/; Max-Age=0; SameSite=Lax";
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setUser: (user) => {
        setAuthCookies(user);
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
          setAuthCookies(state.user);
        } else {
          clearAuthCookies();
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);
