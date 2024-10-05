import { appConfig } from "../utils/appConfig";
import { Client } from "@elastic/elasticsearch";
import * as Sentry from "@sentry/node";
import { LogLevels } from "../utils/appConfig";

export const log = { err, warn, info, debug };

// #region service methods

/**
 * Логирует ошибку
 */
function err(
  message: string,
  exception: unknown | undefined = undefined,
): void {
  if (!exception) {
    console.error("ERROR  ", message);

    if (process.env.NODE_ENV === "production") {
      logToElk({ date: new Date(), logLevel: "ERROR", message: message });
    }
  } else {
    if (exception instanceof Error) {
      console.error("ERROR  ", message, exception.message);
      if (process.env.NODE_ENV === "production") {
        Sentry.captureException(exception);
        logToElk({
          date: new Date(),
          logLevel: "ERROR",
          message: message,
          error: exception.message,
        });
      }
    }
  }
}

/**
 * Логирует предупреждение
 */
function warn(
  message: string,
  exception: unknown | undefined = undefined,
): void {
  if (!exception) {
    console.warn("WARNING  ", message);

    if (
      appConfig.LOG_LEVEL >= LogLevels.Warning &&
      process.env.NODE_ENV === "production"
    ) {
      logToElk({ date: new Date(), logLevel: "WARNING", message: message });
    }
  } else {
    if (exception instanceof Error) {
      console.warn("WARNING  ", message, exception.message);

      if (
        appConfig.LOG_LEVEL >= LogLevels.Warning &&
        process.env.NODE_ENV === "production"
      ) {
        logToElk({
          date: new Date(),
          logLevel: "WARNING",
          message: message,
          error: exception.message,
        });
      }
    }
  }
}

/**
 * Логирует информационное сообщение
 */
function info(message: string): void {
  console.log("INFO  ", message);

  if (
    appConfig.LOG_LEVEL >= LogLevels.Info &&
    process.env.NODE_ENV === "production"
  ) {
    logToElk({ date: new Date(), logLevel: "INFO", message: message });
  }
}

/**
 * Логирует отладочное сообщение
 */
function debug(...args: unknown[]): void {
  console.log("DEBUG  ", ...args);

  if (
    appConfig.LOG_LEVEL >= LogLevels.Debug &&
    process.env.NODE_ENV === "production"
  ) {
    logToElk({
      date: new Date(),
      logLevel: "DEBUG",
      message: JSON.stringify(args),
    });
  }
}

interface ElkDoc {
  date: Date;
  logLevel: string;
  message: string;
  error?: string;
}

/**
 * Отправляет сообщение в ELK
 */
function logToElk(elkDoc: ElkDoc): void {
  if (process.env.NODE_ENV !== "production") return;

  const elkClient = new Client({
    node: appConfig.ELK_URL,
    auth: {
      apiKey: appConfig.ELK_KEY,
    },
  });

  try {
    elkClient.index({
      index: appConfig.ELK_INDEX,
      document: elkDoc,
    });
  } catch (e) {
    Sentry.captureException(e);
  }
}

// #endregion service methods
