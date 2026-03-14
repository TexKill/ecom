import { PromoCode } from "../models/PromoCode";
import { httpError } from "../utils/httpError";

export const calculatePromoDiscount = (args: {
  type: "percent" | "fixed";
  value: number;
  subtotal: number;
}) => {
  const { type, value, subtotal } = args;

  if (subtotal <= 0) return 0;

  const rawDiscount =
    type === "percent" ? subtotal * (value / 100) : value;

  return Number(Math.min(rawDiscount, subtotal).toFixed(2));
};

export const validatePromoCodeForSubtotal = async (
  codeRaw: string,
  subtotal: number,
) => {
  const code = codeRaw.trim().toUpperCase();

  if (!code) {
    throw httpError(400, "Promo code is required");
  }

  const promoCode = await PromoCode.findOne({ code });
  if (!promoCode) {
    throw httpError(404, "Promo code not found");
  }

  if (!promoCode.isActive) {
    throw httpError(400, "Promo code is inactive");
  }

  if (promoCode.expiresAt && promoCode.expiresAt.getTime() < Date.now()) {
    throw httpError(400, "Promo code has expired");
  }

  if (subtotal < promoCode.minOrderAmount) {
    throw httpError(
      400,
      `Minimum order amount for this promo code is ${promoCode.minOrderAmount}`,
    );
  }

  const discountAmount = calculatePromoDiscount({
    type: promoCode.type,
    value: promoCode.value,
    subtotal,
  });

  return {
    promoCode,
    discountAmount,
  };
};
