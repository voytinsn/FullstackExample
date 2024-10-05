import path from "path";
import dotenv from "dotenv";
import { z } from "zod";

// #region helpers

/**
 * Схема .env файла
 */
const configZod = z.object({
  ESB_TOKEN: z.string().min(1),
  ESB_API_URL: z.string().min(1),
  MONGODB_URL: z.string().min(1),
  EXPRESS_PORT: z.coerce.number(),
  AD_GATEWAY_URL: z.string().min(1),
  AD_GATEWAY_KEY: z.string().min(1),
  SMTP_SERVER: z.string().min(1),
  SMTP_PORT: z.coerce.number(),
  SMTP_LOGIN: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  SMTP_SENDER: z.string().min(1),
  PORTAL_URL: z.string().min(1),
  NOTIFICATION_EMAIL: z.string().email(),
  ALLOWED_COMPANIES: z.string().transform(strToIntArr),
  JWT_SECRET: z.string().min(1),
  LDAP_SERVER: z.string().min(1),
  LDAP_ADMIN_DN: z.string().min(1),
  LDAP_ADMIN_PASSWORD: z.string().min(1),
  LDAP_SEARCH_BASE: z.string().min(1),
  LDAP_ALLOWED_GROUPS: z.string().transform(strToStrArr),
  SENTRY_DSN: z.string().min(1),
  ELK_URL: z.string().min(1),
  ELK_KEY: z.string().min(1),
  ELK_INDEX: z.string().min(1),
  LOG_LEVEL: z.coerce.number().transform(intToLogLevel),
});

function strToIntArr(str: string): number[] {
  str.replaceAll(" ", "");
  const strArr = str.split(",");
  const intArr = strArr.map((v) => parseInt(v));
  return intArr;
}

function intToLogLevel(num: number): LogLevels {
  return z.nativeEnum(LogLevels).parse(num);
}

function strToStrArr(str: string): string[] {
  str.replaceAll(" ", "");
  const strArr = str.split(",");
  return strArr;
}

type AppConfig = z.infer<typeof configZod>;

// #endregion helpers

/**
 * Уровни логирования
 */
export enum LogLevels {
  Error = 1,
  Warning = 2,
  Info = 3,
  Debug = 4,
}

// В production переменными окружения занимается Docker compose
if (process.env.NODE_ENV !== "production") {
  dotenv.config({
    path: path.resolve(__dirname, `../../.env.${process.env.NODE_ENV}`),
  });
}

/**
 * Конфиг приложения
 */
export const appConfig: AppConfig = configZod.parse(process.env);
