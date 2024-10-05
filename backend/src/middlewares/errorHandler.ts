import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { log } from "../services/loggerService";
import { ValidationError, NotFoundError } from "../utils/customErrors";
import { HttpStatusCode } from "axios";

/**
 * Обрабатывает ошибки
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  log.debug("In errorHandler:", err);
  if (err instanceof ZodError) {
    res.status(HttpStatusCode.BadRequest).json({
      error: { name: err.name, issues: err.issues },
    });
  } else if (err instanceof Error && err.name === "MongoServerError") {
    res.status(HttpStatusCode.BadRequest).json({
      error: { name: err.name, message: err.message },
    });
  } else if (err instanceof ValidationError) {
    res.status(HttpStatusCode.BadRequest).json({
      error: { name: err.name, message: err.message },
    });
  } else if (err instanceof NotFoundError) {
    res.status(HttpStatusCode.NotFound).json({
      error: { name: err.name, message: err.message },
    });
  } else {
    log.err("Error in errorHandler middleware", err);
    if (process.env.NODE_ENV === "production") {
      res.status(HttpStatusCode.InternalServerError).end("Error on server");
    } else {
      throw err;
    }
  }
}
