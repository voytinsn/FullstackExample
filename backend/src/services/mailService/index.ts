import nodemailer from "nodemailer";
import { appConfig } from "../../utils/appConfig";
import { log } from "../loggerService";

export const mailService = { sendEmail };

/**
 * Отправляет email
 */
async function sendEmail(
  to: string[],
  subject: string,
  html: string,
): Promise<void> {
  log.debug("sendEmail(...)");

  if (process.env.NODE_ENV === "demo") return;

  const transporter = nodemailer.createTransport({
    host: appConfig.SMTP_SERVER,
    port: appConfig.SMTP_PORT,
    secure: false,
    auth: {
      user: appConfig.SMTP_LOGIN,
      pass: appConfig.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.sendMail({
    from: appConfig.SMTP_SENDER,
    to: to.join(", "),
    subject,
    html,
  });
}
