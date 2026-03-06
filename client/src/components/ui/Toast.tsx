"use client";

import { useEffect } from "react";

type ToastType = "success" | "error" | "info";

type ToastProps = {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
};

const typeStyles: Record<ToastType, string> = {
  success: "border-green-200 bg-green-50 text-green-700",
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-gray-300 bg-white text-gray-800",
};

export default function Toast({
  message,
  type = "info",
  duration = 2800,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed right-4 top-4 z-70 max-w-sm rounded-md border px-4 py-3 text-sm shadow-lg ${typeStyles[type]}`}
    >
      {message}
    </div>
  );
}
