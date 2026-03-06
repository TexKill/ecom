"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useProductFilters } from "@/store/useProductFilters";

export function FiltersResetOnRoute() {
  const pathname = usePathname();
  const { resetFilters } = useProductFilters();

  useEffect(() => {
    if (pathname !== "/products") {
      resetFilters();
    }
  }, [pathname, resetFilters]);

  return null;
}
