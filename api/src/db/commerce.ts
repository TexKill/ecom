import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const pool = new Pool({
  connectionString: env.POSTGRES_URL,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
});

export const initCommerceConnection = async () => {
  try {
    await prisma.$connect();
    logger.info("Connected to PostgreSQL commerce database");
    return prisma;
  } catch (error) {
    logger.error("Error connecting to PostgreSQL commerce database", { error });
    throw error;
  }
};
