import * as Sentry from "@sentry/node";
import { appConfig } from "./utils/appConfig";

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: appConfig.SENTRY_DSN,
    tracesSampleRate: 1.0,
  });
}
