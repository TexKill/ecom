import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import databaseSeeder from "./databaseSeeder";
import userRoute from "./routes/User";
import productRoute from "./routes/Product";
import orderRoute from "./routes/Order";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

app.use(express.json());

mongoose
  .connect(process.env.MONGOOSEDB_URL as string)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err: Error) => console.error("Error connecting to MongoDB:", err));

app.use("/api/seed", databaseSeeder);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/orders", orderRoute); // ← додати

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
