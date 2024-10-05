import { Worker } from "worker_threads";
import { log } from "../services/loggerService";
log.info("Инициализация потока фоновых задач");

export const worker = new Worker(require.resolve(`./worker`));
