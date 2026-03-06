import crypto from "crypto";

type LiqPayPayload = Record<string, unknown>;

const toBase64 = (value: string) => Buffer.from(value, "utf8").toString("base64");

export const signLiqPayData = (privateKey: string, data: string) =>
  crypto
    .createHash("sha1")
    .update(`${privateKey}${data}${privateKey}`, "utf8")
    .digest("base64");

export const verifyLiqPaySignature = (
  privateKey: string,
  data: string,
  signature: string,
) => {
  const expected = signLiqPayData(privateKey, data);
  return expected === signature;
};

export const encodeLiqPayPayload = (payload: LiqPayPayload) =>
  toBase64(JSON.stringify(payload));

export const decodeLiqPayPayload = (data: string): LiqPayPayload =>
  JSON.parse(Buffer.from(data, "base64").toString("utf8"));

export const isLiqPaySuccessStatus = (status: unknown) => {
  const normalized = String(status || "").toLowerCase();
  return normalized === "success" || normalized === "sandbox";
};
