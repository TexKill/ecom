import { prisma } from "../db/commerce";
import { httpError } from "../utils/httpError";
import { toApiPromoCode } from "../utils/commerceSerializers";
import { generateDbId } from "../utils/ids";

export const calculatePromoDiscount = (args: {
  type: "percent" | "fixed";
  value: number;
  subtotal: number;
}) => {
  const { type, value, subtotal } = args;

  if (subtotal <= 0) return 0;

  const rawDiscount = type === "percent" ? subtotal * (value / 100) : value;

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

  const promoCode = await prisma.promoCode.findUnique({ where: { code } });
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
    promoCode: toApiPromoCode(promoCode),
    discountAmount,
  };
};

export const getPromoCodes = async () => {
  const promoCodes = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });
  return promoCodes.map(toApiPromoCode);
};

export const createPromoCode = async (payload: {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrderAmount: number;
  isActive?: boolean;
  expiresAt?: string;
}) => {
  const code = payload.code.trim().toUpperCase();
  const existing = await prisma.promoCode.findUnique({ where: { code } });
  if (existing) {
    throw httpError(409, "Promo code already exists");
  }

  const promoCode = await prisma.promoCode.create({
    data: {
      id: generateDbId(),
      code,
      type: payload.type,
      value: payload.value,
      minOrderAmount: payload.minOrderAmount,
      isActive: payload.isActive ?? true,
      expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : undefined,
    },
  });

  return toApiPromoCode(promoCode);
};

export const updatePromoCodeById = async (
  promoCodeId: string,
  payload: Partial<{
    code: string;
    type: "percent" | "fixed";
    value: number;
    minOrderAmount: number;
    isActive: boolean;
    expiresAt: string | null;
  }>,
) => {
  const existing = await prisma.promoCode.findUnique({ where: { id: promoCodeId } });
  if (!existing) {
    throw httpError(404, "Promo code not found");
  }

  if (payload.code) {
    const code = payload.code.trim().toUpperCase();
    const duplicate = await prisma.promoCode.findFirst({
      where: { code, id: { not: promoCodeId } },
      select: { id: true },
    });
    if (duplicate) {
      throw httpError(409, "Promo code already exists");
    }
  }

  const promoCode = await prisma.promoCode.update({
    where: { id: promoCodeId },
    data: {
      ...(payload.code !== undefined ? { code: payload.code.trim().toUpperCase() } : {}),
      ...(payload.type !== undefined ? { type: payload.type } : {}),
      ...(payload.value !== undefined ? { value: payload.value } : {}),
      ...(payload.minOrderAmount !== undefined
        ? { minOrderAmount: payload.minOrderAmount }
        : {}),
      ...(payload.isActive !== undefined ? { isActive: payload.isActive } : {}),
      ...(payload.expiresAt !== undefined
        ? { expiresAt: payload.expiresAt ? new Date(payload.expiresAt) : null }
        : {}),
    },
  });

  return toApiPromoCode(promoCode);
};

export const deletePromoCodeById = async (promoCodeId: string) => {
  const existing = await prisma.promoCode.findUnique({ where: { id: promoCodeId } });
  if (!existing) {
    throw httpError(404, "Promo code not found");
  }

  await prisma.promoCode.delete({ where: { id: promoCodeId } });
};
