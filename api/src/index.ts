import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import databaseSeeder from "./databaseSeeder";
import userRoute from "./routes/User";
import productRoute from "./routes/Product";
import orderRoute from "./routes/Order";
import uploadRoute from "./routes/Upload";
import cartRouter from "./routes/Cart";
import favoritesRouter from "./routes/Favorites";
import subscriberRouter from "./routes/Subscriber";
import promoCodeRoute from "./routes/PromoCode";
import { errorHandler, notFound } from "./middleware/Error";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { requestLogger } from "./middleware/RequestLogger";
import { createRateLimit } from "./middleware/RateLimit";
import { initRedisConnection } from "./utils/redis";
import { initCatalogConnection } from "./db/catalog";
import { initCommerceConnection } from "./db/commerce";

const app = express();
const PORT = env.PORT;
app.set("etag", "strong");
const apiRateLimit = createRateLimit({
  bucket: "api",
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
});
const corsOrigins = env.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(requestLogger);
app.use("/api", apiRateLimit);
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);

void Promise.all([
  initCatalogConnection(),
  initCommerceConnection(),
  initRedisConnection(),
]).catch((error) => {
  logger.error("Failed to initialize application dependencies", { error });
  process.exit(1);
});

if (env.ENABLE_SEED_ROUTES) {
  app.use("/api/seed", databaseSeeder);
}
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/cart", cartRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/subscribers", subscriberRouter);
app.use("/api/promocodes", promoCodeRoute);
app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "api" });
});

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info("Server is listening", { port: PORT, nodeEnv: env.NODE_ENV });
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { reason });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", { err });
});
