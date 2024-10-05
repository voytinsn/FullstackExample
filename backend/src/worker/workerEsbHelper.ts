import { EsbNotification, Guides } from "../services/esbService/esbTypes";
import { pullVpnPasses } from "../services/esbService/esbVpnHelper";
import { VpnPass } from "../models/vpnPassModel";
import { getEmployeeExtraByEsbId } from "../services/esbService/esbEmployeeHelper";
import { Employee, EmployeeModel } from "../models/employeeModel";
import { log } from "../services/loggerService";
import { HydratedDocument } from "mongoose";
import { pullCompanies } from "../services/esbService/esbCompanyHelper";
import { workerState } from "./workerState";

/**
 * Обрабатывает уведомление от шины
 */
export async function onEsbNotification(
  notification: EsbNotification,
): Promise<void> {
  log.debug(`onEsbNotification(notification=${JSON.stringify(notification)}`);
  switch (notification.guide) {
    case Guides.VPN:
      log.info("Шина данных сообщила о изменении в справочнике VPN");
      await onEsbVpnChanged();
      break;
    case Guides.Companies:
      log.info("Шина данных сообщила о изменении в справочнике Предприятия");
      await onEsbCompaniesChanged();
      break;
    default:
      log.warn(
        `Шина отправила неожиданное уведомление: ${JSON.stringify(notification)}`,
      );
  }
}

/**
 * Обрабатывает уведомление о изменении в справочнике VPN
 */
export async function onEsbVpnChanged(): Promise<void> {
  log.debug("onEsbVpnChanged()");

  // Получение и запись в БД разрешений на VPN из шины данных
  const dbVpnPasses: HydratedDocument<VpnPass>[] = await pullVpnPasses();

  // Получение и запись в БД недостающих данных о сотрудниках
  await fillEsbPassesEmployees(dbVpnPasses);

  // Актуализация списка членов группы VPN в AD
  workerState.setActRequired();

  return;

  //#region вспомогательные функции
  async function fillEsbPassesEmployees(
    dbVpnPasses: HydratedDocument<VpnPass>[],
  ) {
    log.info(`Получение данных о сотрудниках, которых нет в БД приложения`);
    const employeeUpdatedResult = {
      exist: 0,
      new: 0,
      fail: 0,
    };

    for (const dbPass of dbVpnPasses) {
      if (!dbPass.employee) {
        try {
          const employee: Employee | null = await fillEsbPassEmployee(dbPass);
          if (employee) {
            employeeUpdatedResult.new++;
          } else {
            employeeUpdatedResult.fail++;
          }
        } catch (e) {
          log.err(
            `Ошибка в при получении данных о сотруднике по esbID ${dbPass.employeeEsbId}`,
            e,
          );
          employeeUpdatedResult.fail++;
        }
      } else {
        employeeUpdatedResult.exist++;
      }
    }

    log.info(
      `Результат получения данных о сотрудниках:` +
        `\n Обработано:${dbVpnPasses.length}` +
        `\n Добавлено:${employeeUpdatedResult.new}` +
        `\n Не изменено:${employeeUpdatedResult.exist}` +
        `\n Ошибок:${employeeUpdatedResult.fail}`,
    );
  }

  async function fillEsbPassEmployee(
    vpnPass: HydratedDocument<VpnPass>,
  ): Promise<Employee | null> {
    let dbEmployee = await EmployeeModel.findOne({
      esbId: vpnPass.employeeEsbId,
    });

    if (!dbEmployee) {
      const employee = await getEmployeeExtraByEsbId(vpnPass.employeeEsbId);
      dbEmployee = new EmployeeModel(employee);
      await dbEmployee.save();
    }

    vpnPass.employee = dbEmployee._id;
    await vpnPass.save();
    return dbEmployee;
  }
  //#endregion
}

/**
 * Обрабатывает уведомление о изменении в справочнике VPN
 */
export async function onEsbCompaniesChanged(): Promise<void> {
  log.debug("onEsbCompaniesChanged()");

  // Получение и запись в БД предприятий из шины данных
  await pullCompanies();
}
