import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
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

const app = express();
const PORT = process.env.PORT || 9000;
const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(express.json());
app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  }),
);

mongoose
  .connect(process.env.MONGOOSEDB_URL as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err: Error) => console.error("Error connecting to MongoDB:", err));

if (process.env.ENABLE_SEED_ROUTES === "true") {
  app.use("/api/seed", databaseSeeder);
}
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute);
app.use("/api/upload", uploadRoute);
app.use("/api/cart", cartRouter);
app.use("/api/favorites", favoritesRouter);
app.use("/api/subscribers", subscriberRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
