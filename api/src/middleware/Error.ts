import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { logger } from "../utils/logger";

type ApiError = Error & {
  statusCode?: number;
  errors?: Array<{ field: string; message: string }>;
};

const mapIssues = (error: ZodError) =>
  error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`) as ApiError;
  error.statusCode = 404;
  next(error);
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof multer.MulterError) {
    logger.warn("Multer error", {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      code: err.code,
      message: err.message,
    });

    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ message: "File too large. Max size is 5MB" });
      return;
    }
    res.status(400).json({ message: err.message });
    return;
  }

  if (err instanceof ZodError) {
    logger.warn("Request validation error", {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      errors: mapIssues(err),
    });

    res.status(400).json({
      message: "Validation failed",
      errors: mapIssues(err),
    });
    return;
  }

  const error = err as ApiError;
  const statusCode = error.statusCode ?? (res.statusCode === 200 ? 500 : res.statusCode);

  const logLevel = statusCode >= 500 ? "error" : "warn";
  logger[logLevel]("Request failed", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    message: error.message,
    error,
  });

  res.status(statusCode).json({
    message: error.message || "Internal server error",
    ...(error.errors ? { errors: error.errors } : {}),
  });
};
