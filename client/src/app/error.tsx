"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
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
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-xl border border-red-100 bg-red-50 p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
          Something went wrong
        </p>
        <h1 className="mt-2 text-2xl font-bold text-red-900">
          We could not load this page
        </h1>
        <p className="mt-3 text-sm text-red-700">
          Try again. If the issue persists, return to the homepage.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
