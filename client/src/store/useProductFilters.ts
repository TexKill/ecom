import { create } from "zustand";

interface FilterState {
  pageNumber: number;
  pageSize: number;
  setPage: (page: number) => void;
}

export const useProductFilters = create<FilterState>((set) => ({
  pageNumber: 1,
  pageSize: 8,
  setPage: (page) => set({ pageNumber: page }),
}));
