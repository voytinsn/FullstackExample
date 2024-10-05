import { Request, Response, NextFunction } from "express";

/**
 * Обрабатывает ошибки
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof Error) {
    console.error(err.message);
    res.status(500).json(err.message);
  } else {
    console.error("unexpected type of error", err);
    res.status(500)
  }
}
