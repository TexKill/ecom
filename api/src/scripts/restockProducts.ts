import dotenv from "dotenv";
import mongoose from "mongoose";
import { restockProductsRandom } from "../utils/autoRestock";

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGOOSEDB_URL as string);
    const updatedCount = await restockProductsRandom();
    console.log(`[Restock] Random restock complete: ${updatedCount} products updated`);
  } catch (error) {
    console.error("[Restock] Failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

void run();

