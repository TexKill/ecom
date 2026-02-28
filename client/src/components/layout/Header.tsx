"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";

export default function Header() {
  const router = useRouter();

  // Hydration-safe Zustand reading (bypasses the useEffect issue entirely)
  const isHydrated = useSyncExternalStore(
    (subscribe) => {
      window.addEventListener("storage", subscribe);
      return () => window.removeEventListener("storage", subscribe);
    },
    () => true,
    () => false, // Server always returns false
  );

  const { user, logout } = useAuthStore();
  const totalQty = useCartStore((s) => s.totalQty());
  const clearCart = useCartStore((s) => s.clearCart);
  const totalFavorites = useFavoritesStore((s) => s.totalFavorites());
  const clearFavorites = useFavoritesStore((s) => s.clearFavorites);
  const loadFavoritesFromServer = useFavoritesStore(
    (s) => s.loadFavoritesFromServer,
  );

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/products?keyword=${search.trim()}`);
  };

  const handleLogout = () => {
    clearCart(user?.token);
    clearFavorites(user?.token);
    logout();
    router.push("/login");
  };

  useEffect(() => {
    if (user?.token) {
      loadFavoritesFromServer(user.token);
    }
  }, [user?.token, loadFavoritesFromServer]);

  return (
    <header className="w-full sticky top-0 z-50 bg-white">
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold tracking-tight shrink-0">
            TexKillDev
          </Link>

          {/* Nav links — desktop */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              href="/"
              className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-red-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              Home
            </Link>
            <Link
              href="/products"
              className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-red-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              Products
            </Link>
            <Link
              href="/orders"
              className="relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-red-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              Orders
            </Link>
          </nav>

          {/* Search */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex items-center bg-gray-100 rounded px-3 py-2 gap-2 border-2 border-transparent transition-all duration-300 focus-within:border-red-500 focus-within:bg-white"
          >
            <input
              type="text"
              placeholder="What are you looking for?"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full"
            />
            <button type="submit">
              <Search size={18} className="text-gray-500" />
            </button>
          </form>

          {/* Icons */}
          <div className="flex items-center gap-4">
            <Link href="/favorites" className="relative hidden md:block">
              <Heart size={22} />
              {isHydrated && totalFavorites > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalFavorites}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative">
              <ShoppingCart size={22} />
              {isHydrated && totalQty > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalQty}
                </span>
              )}
            </Link>

            {isHydrated ? (
              user ? (
                <div className="flex items-center gap-3">
                  <Link href="/account">
                    <User size={22} />
                  </Link>
                  <button onClick={handleLogout}>
                    <LogOut
                      size={20}
                      className="text-gray-500 hover:text-red-500"
                    />
                  </button>
                </div>
              ) : (
                <Link href="/login">
                  <User size={22} />
                </Link>
              )
            ) : (
              // Changed to w-5.5 h-5.5 as suggested by Tailwind
              <div className="w-5.5 h-5.5"></div>
            )}

            {/* Burger — mobile */}
            <button
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 flex flex-col gap-3 text-sm font-medium border-t pt-3 bg-white">
            <Link href="/" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link href="/products" onClick={() => setMenuOpen(false)}>
              Products
            </Link>
            <Link href="/orders" onClick={() => setMenuOpen(false)}>
              Orders
            </Link>
            <Link href="/favorites" onClick={() => setMenuOpen(false)}>
              Favorites
            </Link>
            <form
              onSubmit={handleSearch}
              className="flex items-center bg-gray-100 rounded px-3 py-2 gap-2 mt-2"
            >
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none text-sm w-full"
              />
              <button type="submit">
                <Search size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
