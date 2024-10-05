import "../initSentry";
import { parentPort, MessagePort } from "worker_threads";
import { appConfig } from "../utils/appConfig";
import { ThreadMessage, ThreadMessageTypes } from "../types";
import { EsbNotificationZod } from "../services/esbService/esbParser";
import { connect } from "mongoose";
import { log } from "../services/loggerService";
import {
  onEsbCompaniesChanged,
  onEsbNotification,
  onEsbVpnChanged,
} from "./workerEsbHelper";
import { workerState } from "./workerState";
import { actualizeVpnIfRequired } from "./workerVpnHelper";

const threadPort = parentPort as MessagePort;

async function main() {
  // Подключение к БД
  await connect(appConfig.MONGODB_URL, { authSource: "admin" });
  log.info("Установлено подключение к базе данных из фонового потока");

  // Синхронизация справочника разрешений на VPN
  // и актуализация списка членов группы VPN
  await onEsbVpnChanged();

  // Синхронизация справочника Предприятия
  await onEsbCompaniesChanged();

  // Актуализация группы VPN
  workerState.setActRequired();
  actualizeVpnIfRequired();

  //  Подписка на сообщения от основного потока
  threadPort.on("message", async (message: ThreadMessage) => {
    log.debug("Фоновый поток получил сообщение основного потока", message);
    try {
      switch (message.type) {
        case ThreadMessageTypes.OnEsbNotification:
          log.debug("case ThreadMessageTypes.OnEsbNotification");
          await onEsbNotification(EsbNotificationZod.parse(message.data));
          break;
        case ThreadMessageTypes.OnExclusionsChanged:
          log.debug("case ThreadMessageTypes.OnExclusionsChanged");
          workerState.setActRequired();
          break;
      }
    } catch (e) {
      log.err(
        `Ошибка при обработке сообщения от основного потока. Сообщение: ${JSON.stringify(message)}`,
        e,
      );
    }
  });

  // Ежечасная актуализация членов группы VPN
  setInterval(workerState.setActRequired, 1000 * 60 * 60);

  // Каждые 5 секунд проверяет стоит ли отметка о том,
  // что требуется актуализировать группу VPN и
  // актуализирует, если отметка стоит
  setInterval(actualizeVpnIfRequired, 5000);
}

try {
  main();
} catch (e) {
  // Здесь отлавливаются только критические ошибки
  // после которых приложение не может продолжить работу
  log.err("Критическая ошибка в функции main фонового потока", e);
  throw e;
}
