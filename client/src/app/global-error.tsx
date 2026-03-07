"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="m-0">
        <div className="flex min-h-screen items-center justify-center bg-red-50 px-4">
          <div className="w-full max-w-xl rounded-xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
              Critical error
            </p>
            <h1 className="mt-2 text-2xl font-bold text-red-900">
              Application failed to render
            </h1>
            <p className="mt-3 text-sm text-red-700">
              Please retry. If this continues, refresh the page.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Retry
              </button>
              <a
                href="/"
                className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
              >
                Open home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
