import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export const catalogConnection = mongoose.createConnection();

let catalogConnectPromise: Promise<typeof catalogConnection> | null = null;

export const initCatalogConnection = async () => {
  if (catalogConnection.readyState === 1) {
    return catalogConnection;
  }

  if (!catalogConnectPromise) {
    catalogConnectPromise = catalogConnection
      .openUri(env.MONGODB_URL)
      .then((connection) => {
        logger.info("Connected to MongoDB catalog database");
        return connection;
      })
      .catch((error: Error) => {
        catalogConnectPromise = null;
        logger.error("Error connecting to MongoDB catalog database", { error });
        throw error;
      });
  }

  return catalogConnectPromise;
};
