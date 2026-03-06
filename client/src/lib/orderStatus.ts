import { OrderStatus } from "@/types";

type OrderStatusTexts = {
  statusPending: string;
  statusProcessing: string;
  statusShipped: string;
  statusDelivered: string;
  statusCancelled: string;
};

export const normalizeOrderStatus = (status?: string): OrderStatus => {
  switch (status) {
    case "pending":
    case "processing":
    case "shipped":
    case "delivered":
    case "cancelled":
      return status;
    default:
      return "pending";
  }
};

export const getOrderStatusMeta = (status: string | undefined, t: OrderStatusTexts) => {
  const normalized = normalizeOrderStatus(status);

  switch (normalized) {
    case "pending":
      return {
        value: normalized,
        label: t.statusPending,
        badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
      };
    case "processing":
      return {
        value: normalized,
        label: t.statusProcessing,
        badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
      };
    case "shipped":
      return {
        value: normalized,
        label: t.statusShipped,
        badgeClass: "bg-cyan-100 text-cyan-700 border-cyan-200",
      };
    case "delivered":
      return {
        value: normalized,
        label: t.statusDelivered,
        badgeClass: "bg-green-100 text-green-700 border-green-200",
      };
    case "cancelled":
      return {
        value: normalized,
        label: t.statusCancelled,
        badgeClass: "bg-red-100 text-red-700 border-red-200",
      };
    default:
      return {
        value: "pending" as const,
        label: t.statusPending,
        badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
      };
  }
};

