import { OrderStatus } from "@/types";

type OrderStatusTexts = {
  statusNewOrder: string;
  statusPendingPayment: string;
  statusPaid: string;
  statusProcessing: string;
  statusConfirmed: string;
  statusPreparingShipment: string;
  statusShipped: string;
  statusPickupPoint: string;
  statusDelivered: string;
  statusCompleted: string;
  statusCancelled: string;
  statusReturnRequested: string;
  statusReturned: string;
};

export const normalizeOrderStatus = (status?: string): OrderStatus => {
  switch (status) {
    case "new_order":
    case "pending_payment":
    case "paid":
    case "processing":
    case "confirmed":
    case "preparing_shipment":
    case "shipped":
    case "pickup_point":
    case "delivered":
    case "completed":
    case "return_requested":
    case "returned":
    case "cancelled":
      return status;
    default:
      return "new_order";
  }
};

export const getOrderStatusMeta = (
  status: string | undefined,
  t: OrderStatusTexts,
) => {
  const normalized = normalizeOrderStatus(status);

  switch (normalized) {
    case "new_order":
      return {
        value: normalized,
        label: t.statusNewOrder,
        badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
      };
    case "pending_payment":
      return {
        value: normalized,
        label: t.statusPendingPayment,
        badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
      };
    case "paid":
      return {
        value: normalized,
        label: t.statusPaid,
        badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
      };
    case "processing":
      return {
        value: normalized,
        label: t.statusProcessing,
        badgeClass: "bg-orange-100 text-orange-700 border-orange-200",
      };
    case "confirmed":
      return {
        value: normalized,
        label: t.statusConfirmed,
        badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
      };
    case "preparing_shipment":
      return {
        value: normalized,
        label: t.statusPreparingShipment,
        badgeClass: "bg-indigo-100 text-indigo-700 border-indigo-200",
      };
    case "shipped":
      return {
        value: normalized,
        label: t.statusShipped,
        badgeClass: "bg-cyan-100 text-cyan-700 border-cyan-200",
      };
    case "pickup_point":
      return {
        value: normalized,
        label: t.statusPickupPoint,
        badgeClass: "bg-violet-100 text-violet-700 border-violet-200",
      };
    case "delivered":
      return {
        value: normalized,
        label: t.statusDelivered,
        badgeClass: "bg-green-100 text-green-700 border-green-200",
      };
    case "completed":
      return {
        value: normalized,
        label: t.statusCompleted,
        badgeClass: "bg-lime-100 text-lime-700 border-lime-200",
      };
    case "cancelled":
      return {
        value: normalized,
        label: t.statusCancelled,
        badgeClass: "bg-red-100 text-red-700 border-red-200",
      };
    case "return_requested":
      return {
        value: normalized,
        label: t.statusReturnRequested,
        badgeClass: "bg-yellow-100 text-yellow-700 border-yellow-200",
      };
    case "returned":
      return {
        value: normalized,
        label: t.statusReturned,
        badgeClass: "bg-rose-100 text-rose-700 border-rose-200",
      };
    default:
      return {
        value: "new_order" as const,
        label: t.statusNewOrder,
        badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
      };
  }
};
