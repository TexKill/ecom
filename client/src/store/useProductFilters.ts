import { create } from "zustand";

// The sort options should match the enum in our Zod script on the backend
export type SortOption =
  | "price_asc"
  | "price_desc"
  | "rating_desc"
  | "name_asc"
  | "newest";

interface ProductFiltersState {
  // Base
  pageNumber: number;
  pageSize: number;

  // Filters
  category: string;
  brand: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  sort: SortOption;

  // Actions
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setCategory: (category: string) => void;
  toggleBrand: (brandName: string) => void;
  setPriceRange: (min?: number, max?: number) => void;
  setSort: (sort: SortOption) => void;
  resetFilters: () => void;
}

export const useProductFilters = create<ProductFiltersState>((set) => ({
  pageNumber: 1,
  pageSize: 8,
  category: "",
  brand: "",
  minPrice: undefined,
  maxPrice: undefined,
  sort: "newest",

  setPage: (page) => set({ pageNumber: page }),

  setPageSize: (size) => set({ pageSize: size }),

  setCategory: (category) => set({ category, pageNumber: 1 }), // Reset the page when changing the category

  toggleBrand: (brandName) =>
    set((state) => {
      const brands = state.brand ? state.brand.split(",") : [];
      const index = brands.indexOf(brandName);

      if (index > -1) {
        brands.splice(index, 1); // Delete if already exists
      } else {
        brands.push(brandName); // Add if not present
      }

      return { brand: brands.join(","), pageNumber: 1 };
    }),

  setPriceRange: (min, max) =>
    set({ minPrice: min, maxPrice: max, pageNumber: 1 }),

  setSort: (sort) => set({ sort, pageNumber: 1 }),

  resetFilters: () =>
    set({
      pageNumber: 1,
      pageSize: 8,
      category: "",
      brand: "",
      minPrice: undefined,
      maxPrice: undefined,
      sort: "newest",
    }),
}));
