"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  //  Use useState to create the QueryClient only once when the component mounts,
  // and reuse the same instance for the entire app. This ensures that the cache is shared across all components.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Set a default staleTime of 1 minute for all queries to reduce unnecessary refetching when navigating between pages.
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
