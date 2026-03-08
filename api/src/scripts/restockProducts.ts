import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { restockRandomProducts } from "../services/ProductService";

const run = async () => {
  try {
    await mongoose.connect(env.MONGOOSEDB_URL);
    const updatedCount = await restockRandomProducts();
    logger.info("Random restock complete", { updatedCount });
  } catch (error) {
    logger.error("Random restock failed", { error });
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

void run();
