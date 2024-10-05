import { Request, Response, NextFunction } from "express";
import jsonwebtoken, { JsonWebTokenError } from "jsonwebtoken";
import { appConfig } from "../utils/appConfig";
import { HttpStatusCode } from "axios";
import { log } from "../services/loggerService";

/**
 * Проверяет авторизацию по JWT
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  log.debug("requireAuth(...)");

  if (process.env.NODE_ENV === "demo") return next();

  try {
    const token: string | null = getTokenFromHeader(req);

    if (!token) {
      log.debug("Reject, authorization required");
      return res
        .status(HttpStatusCode.Unauthorized)
        .json({ error: "Authorization required" });
    }

    try {
      jsonwebtoken.verify(token, appConfig.JWT_SECRET);
      next();
    } catch (e: unknown) {
      log.warn("Error on JWT validation", e);
      if (e instanceof JsonWebTokenError) {
        return res
          .status(HttpStatusCode.Unauthorized)
          .json({ error: "Invalid token" });
      } else {
        throw e;
      }
    }
  } catch (e) {
    next(e);
  }

  function getTokenFromHeader(req: Request): string | null {
    log.debug("getTokenFromHeader()");

    const authorization = req.get("authorization");
    if (authorization && authorization.startsWith("Bearer ")) {
      return authorization.replace("Bearer ", "");
    }
    return null;
  }
}
