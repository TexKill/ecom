import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const rawEnv = {
  ...process.env,
  MONGODB_URL: process.env.MONGODB_URL ?? process.env.MONGOOSEDB_URL,
};

const booleanFromEnv = (defaultValue: "true" | "false" = "false") =>
  z.preprocess(
    (value) => {
      if (value === undefined || value === null || value === "")
        return defaultValue;
      if (typeof value === "string") return value.toLowerCase();
      return value;
    },
    z.enum(["true", "false"]).transform((value) => value === "true"),
  );

const optionalTrimmedString = z.preprocess((value) => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}, z.string().optional());

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
    PORT: z.coerce.number().int().min(1).max(65535).default(9000),
    MONGODB_URL: z.string().trim().min(1, "MONGODB_URL is required"),
    POSTGRES_URL: z.string().trim().min(1, "POSTGRES_URL is required"),
    JWT_SECRET: z.string().trim().min(1, "JWT_SECRET is required"),
    CORS_ORIGIN: z.string().default("http://localhost:3000"),
    ENABLE_SEED_ROUTES: booleanFromEnv("false"),
    SEED_KEY: z.string().trim().default("change_me"),
    CLOUDINARY_CLOUD_NAME: z
      .string()
      .trim()
      .min(1, "CLOUDINARY_CLOUD_NAME is required"),
    CLOUDINARY_API_KEY: z
      .string()
      .trim()
      .min(1, "CLOUDINARY_API_KEY is required"),
    CLOUDINARY_API_SECRET: z
      .string()
      .trim()
      .min(1, "CLOUDINARY_API_SECRET is required"),
    LIQPAY_PUBLIC_KEY: optionalTrimmedString,
    LIQPAY_PRIVATE_KEY: optionalTrimmedString,
    LIQPAY_SANDBOX: booleanFromEnv("false"),
    API_PUBLIC_URL: z.string().url().default("http://localhost:9000"),
    CLIENT_URL: z.string().url().default("http://localhost:3000"),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().min(1000).default(60_000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(120),
    AUTH_RATE_LIMIT_WINDOW_MS: z.coerce
      .number()
      .int()
      .min(1000)
      .default(60_000),
    AUTH_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(10),
    UPLOAD_RATE_LIMIT_WINDOW_MS: z.coerce
      .number()
      .int()
      .min(1000)
      .default(60_000),
    UPLOAD_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().min(1).default(20),
    LIQPAY_CALLBACK_RATE_LIMIT_WINDOW_MS: z.coerce
      .number()
      .int()
      .min(1000)
      .default(60_000),
    LIQPAY_CALLBACK_RATE_LIMIT_MAX_REQUESTS: z.coerce
      .number()
      .int()
      .min(1)
      .default(120),
    REDIS_URL: optionalTrimmedString,
    REDIS_KEY_PREFIX: z.string().trim().default("ecom"),
    CACHE_TTL_SECONDS: z.coerce.number().int().min(1).default(60),
  })
  .superRefine((data, ctx) => {
    const hasPublic = Boolean(data.LIQPAY_PUBLIC_KEY);
    const hasPrivate = Boolean(data.LIQPAY_PRIVATE_KEY);

    if (hasPublic !== hasPrivate) {
      ctx.addIssue({
        code: "custom",
        path: hasPublic ? ["LIQPAY_PRIVATE_KEY"] : ["LIQPAY_PUBLIC_KEY"],
        message: "LiqPay keys must be provided together",
      });
    }

    if (data.ENABLE_SEED_ROUTES && data.SEED_KEY === "change_me") {
      ctx.addIssue({
        code: "custom",
        path: ["SEED_KEY"],
        message: "SEED_KEY must be changed when ENABLE_SEED_ROUTES=true",
      });
    }
  });

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `- ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");

  throw new Error(`Invalid environment variables:\n${issues}`);
}

export const env = parsed.data;
