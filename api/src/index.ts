import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import databaseSeeder from "./databaseSeeder";
import userRoute from "./routes/User";
import productRoute from "./routes/Product";
import orderRoute from "./routes/Order";
import uploadRoute from "./routes/Upload";
import cartRouter from "./routes/Cart";
import favoritesRouter from "./routes/Favorites";
import subscriberRouter from "./routes/Subscriber";
import { errorHandler, notFound } from "./middleware/Error";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { requestLogger } from "./middleware/RequestLogger";
import { createRateLimit } from "./middleware/RateLimit";

const app = express();
const PORT = env.PORT;
const apiRateLimit = createRateLimit({
  bucket: "api",
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
});
const corsOrigins = env.CORS_ORIGIN
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());
app.use(requestLogger);
app.use("/api", apiRateLimit);
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);

mongoose
  .connect(env.MONGOOSEDB_URL)
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err: Error) => logger.error("Error connecting to MongoDB", { err }));

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
