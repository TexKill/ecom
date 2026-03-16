import { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger";

type RateLimitOptions = {
  bucket: string;
  windowMs: number;
  maxRequests: number;
  message?: string;
};

type BucketState = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, BucketState>();
const CLEANUP_THRESHOLD = 10_000;

const getClientKey = (req: Request) => req.ip || "unknown";

const setRateLimitHeaders = (
  res: Response,
  limit: number,
  remaining: number,
  resetAt: number,
) => {
  res.setHeader("x-ratelimit-limit", String(limit));
  res.setHeader("x-ratelimit-remaining", String(Math.max(0, remaining)));
  res.setHeader("x-ratelimit-reset", String(Math.ceil(resetAt / 1000)));
};

export const createRateLimit = ({
  bucket,
  windowMs,
  maxRequests,
  message = "Too many requests. Please try again later.",
}: RateLimitOptions) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestId = (req as Request & { requestId?: string }).requestId;
    const now = Date.now();
    if (buckets.size > CLEANUP_THRESHOLD) {
      for (const [key, value] of buckets.entries()) {
        if (now > value.resetAt) buckets.delete(key);
      }
    }

    const clientKey = getClientKey(req);
    const key = `${bucket}:${clientKey}`;
    const existing = buckets.get(key);

    if (!existing || now > existing.resetAt) {
      const resetAt = now + windowMs;
      buckets.set(key, { count: 1, resetAt });
      setRateLimitHeaders(res, maxRequests, maxRequests - 1, resetAt);
      next();
      return;
    }

    existing.count += 1;
    const remaining = maxRequests - existing.count;
    setRateLimitHeaders(res, maxRequests, remaining, existing.resetAt);

    if (existing.count > maxRequests) {
      const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
      res.setHeader("retry-after", String(retryAfterSec));

      logger.warn("Rate limit exceeded", {
        requestId,
        bucket,
        ip: req.ip,
        method: req.method,
        path: req.originalUrl,
        maxRequests,
        windowMs,
      });

      res.status(429).json({ message });
      return;
    }

    next();
  };
};
