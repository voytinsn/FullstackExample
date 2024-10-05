import { Router, Response } from "express";
import { EsbNotification } from "../services/esbService/esbTypes";
import { EsbNotificationZod } from "../services/esbService/esbParser";
import { ThreadMessage, ThreadMessageTypes } from "../types";
import { worker } from "../worker/initWorker";
import { log } from "../services/loggerService";

export const esbRouter = Router();

/**
 * Принимает уведомления от шины
 */
esbRouter.post("/notify", (req, res: Response<"ok">, next) => {
  log.info(`Получено уведомление от шины ${JSON.stringify(req.body)}`);

  try {
    const notification: EsbNotification = EsbNotificationZod.parse(req.body);

    // Отправка сообщения в фоновый поток
    const message: ThreadMessage = {
      type: ThreadMessageTypes.OnEsbNotification,
      data: notification,
    };
    worker.postMessage(message);

    // Отправка шине подтверждения получения уведомления
    res.send("ok");
  } catch (e) {
    next(e);
  }
});
