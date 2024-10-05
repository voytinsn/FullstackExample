import "./initSentry";
import { connect } from "mongoose";
import { appConfig } from "./utils/appConfig";
import { app } from "./app";
import { log } from "./services/loggerService";

// Инициализация потока для выполнения фоновых задач
import "./worker/initWorker";

async function main() {
  await connect(appConfig.MONGODB_URL, { authSource: "admin" });
  log.info("Установлено подключение к базе данных из основного потока потока");

  const port = appConfig.EXPRESS_PORT;
  app.listen(port, () => {
    log.info(`Веб-сервер запущен и прослушивает порт ${port}`);
  });
}

main();
