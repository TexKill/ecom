import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";

const validator =
  <T>(schema: ZodType<T>, source: "body" | "params" | "query") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (source === "body") req.body = schema.parse(req.body);
      if (source === "params") schema.parse(req.params);
      if (source === "query") schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) return next(error);
      const validationError = new Error(`Invalid request ${source}`) as Error & {
        statusCode?: number;
      };
      validationError.statusCode = 400;
      next(validationError);
    }
  };

export const validateBody = <T>(schema: ZodType<T>) => validator(schema, "body");
export const validateParams = <T>(schema: ZodType<T>) =>
  validator(schema, "params");
export const validateQuery = <T>(schema: ZodType<T>) => validator(schema, "query");
