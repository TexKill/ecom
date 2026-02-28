import { NextFunction, Request, Response } from "express";
import { ZodError, ZodType } from "zod";

const mapIssues = (error: ZodError) =>
  error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));

const validator =
  <T>(schema: ZodType<T>, source: "body" | "params" | "query") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (source === "body") req.body = schema.parse(req.body);
      if (source === "params") schema.parse(req.params);
      if (source === "query") schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: "Validation failed", errors: mapIssues(error) });
        return;
      }
      res.status(400).json({ message: `Invalid request ${source}` });
    }
  };

export const validateBody = <T>(schema: ZodType<T>) => validator(schema, "body");
export const validateParams = <T>(schema: ZodType<T>) =>
  validator(schema, "params");
export const validateQuery = <T>(schema: ZodType<T>) => validator(schema, "query");
