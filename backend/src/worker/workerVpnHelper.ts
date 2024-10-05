import axios from "axios";
import {
  Employee,
  EmployeeModel,
  getEmployeeFullName,
} from "../models/employeeModel";
import { VpnPassModel, VpnPassPopulated } from "../models/vpnPassModel";
import { adService } from "../services/adService";
import { AdUser } from "../services/adService";
import {
  getAlwaysDisabledExclusions,
  getAlwaysEnabledExclusions,
  VpnExclusion,
} from "../models/vpnExclusionModel";
import { HydratedDocument } from "mongoose";
import { log } from "../services/loggerService";
import { appConfig } from "../utils/appConfig";
import { groupChangedTemplate } from "../services/mailService/groupChangedTemplate";
import { mailService } from "../services/mailService";
import { workerState } from "./workerState";
import moment from "moment";

/**
 * Получает записи о VPN с активным периодом действия
 */
export async function getActiveVpnPasses(): Promise<
  HydratedDocument<VpnPassPopulated>[]
> {
  log.debug("getActiveVpnPasses()");

  const date = moment().startOf("day");
  const vpnPasses = await VpnPassModel.find({
    dateStart: { $lte: date },
    dateEnd: { $gte: date },
    trash: false,
    employee: { $ne: null },
  }).populate<{ employee: Employee }>("employee");

  return vpnPasses;
}

/**
 * Получает записи о VPN с активным
 * или еще не наступившим периодом действия
 */
export async function getUnexpiredVpnPasses(): Promise<
  HydratedDocument<VpnPassPopulated>[]
> {
  log.debug("getUnexpiredVpnPasses()");

  const date = new Date();
  const vpnPasses = await VpnPassModel.find({
    dateEnd: { $gte: date },
    trash: false,
    employee: { $ne: null },
  }).populate<{ employee: Employee }>("employee");

  return vpnPasses;
}

/**
 * Актуализирует список членов группы VPN и
 * отправляет уведомление об изменениях
 */
export async function actualizeVpnAndNotify(): Promise<void> {
  log.debug("actualizeVpnAndNotify()");
  try {
    workerState.updateActDate();
    const changes: VpnGroupChanges = await actualizeVpnGroup();
    workerState.setActNotRequired();
    await updateInGroupStatus(changes);
    try {
      await notifyVpnGroupChanged(changes);
    } catch (e: unknown) {
      log.err("Ошибка при отправке уведомлений о изменении в группе VPN", e);
    }
  } catch (e: unknown) {
    log.err("Ошибка при актуализации членов группы VPN в Active Directory", e);
  }
}

/**
 * Актуализирует группу VPN если стоит отметка,
 * что в этом есть потребность и за последнюю минуту
 * актуализация не производилась
 */
export async function actualizeVpnIfRequired(): Promise<void> {
  log.debug("actualizeVpnIfRequired()");
  if (workerState.isActRequired() && !workerState.recentlyAct()) {
    await actualizeVpnAndNotify();
  }
}

/**
 * Добавляет нужных и удаляет ненужных членов группы VPN,
 * делает у разрешений на VPN пометку в БД о присутствии
 * пользователя в группе
 */
async function actualizeVpnGroup(): Promise<VpnGroupChanges> {
  log.debug("actualizeVpnGroup()");
  const inGroupUsers: AdUser[] = await adService.getVpnGroupMembers();
  const activeVpnPasses: HydratedDocument<VpnPassPopulated>[] =
    await getActiveVpnPasses();
  const alwaysEnabled: VpnExclusion[] = await getAlwaysEnabledExclusions();
  const alwaysDisabled: VpnExclusion[] = await getAlwaysDisabledExclusions();
  const inGroupLogins = inGroupUsers.map((adUser) => adUser.samAccountName);

  const result: VpnGroupChanges = {
    addedByPasses: [],
    addedByExclusion: [],
    removedByPasses: [],
    removedByExclusion: [],
  };

  // Добавление в группу недостающих пользователей
  // на основании разрешений на VPN и запись отметок в БД,
  // за исключением пользователей из списка всегда выключенных
  result.addedByPasses = await addToGroupByPasses(
    inGroupLogins,
    activeVpnPasses,
    alwaysDisabled,
  );

  // Добавление в группу недостающих пользователей из списка всегда включенных
  result.addedByExclusion = await addToGroupByExclusions(
    inGroupLogins,
    alwaysEnabled,
  );

  // Удаление из группы пользователей, которых нет
  // в списке разрешений на VPN, за исключением пользователей
  // из списка всегда включенных
  result.removedByPasses = await removeFromGroupByPasses(
    inGroupUsers,
    activeVpnPasses,
    alwaysEnabled,
  );

  // Удаление из группы пользователей из списка всегда отключенных
  result.removedByExclusion = await removeFromGroupByExclusions(
    alwaysDisabled,
    inGroupUsers,
  );

  return result;

  // #region вспомогательные функции

  async function addToGroupByPasses(
    inGroupUsersLogins: string[],
    activeVpnPasses: HydratedDocument<VpnPassPopulated>[],
    alwaysDisabled: VpnExclusion[],
  ): Promise<VpnPassPopulated[]> {
    log.debug("addToGroupByPasses(...)");

    const added: VpnPassPopulated[] = [];

    const alwaysDisabledLogins: string[] = alwaysDisabled.map(
      (exclusion) => exclusion.login,
    );

    for (const pass of activeVpnPasses) {
      try {
        if (!pass.employee) {
          pass.inVpnGroup = false;
          pass.notInGroupReason =
            "В БД нет сопоставленного с разрешением на VPN сотрудника";
          await pass.save();
        } else if (!pass.employee.login) {
          pass.inVpnGroup = false;
          pass.notInGroupReason = "У сотрудника не указан логин";
          await pass.save();
        } else if (alwaysDisabledLogins.includes(pass.employee.login)) {
          pass.inVpnGroup = false;
          pass.notInGroupReason =
            "Пользователю запрещен VPN согласно списку исключений";
          await pass.save();
        } else if (!inGroupUsersLogins.includes(pass.employee.login)) {
          log.info(
            `Добавление в группу VPN пользователя ${pass.employee.login},` +
              ` разрешение на VPN c esbId ${pass.esbId}`,
          );
          try {
            await adService.addUserToVpnGroup({
              login: pass.employee.login,
            });
            pass.inVpnGroup = true;
            pass.notInGroupReason = undefined;
            await pass.save();
            added.push(pass);
          } catch (e: unknown) {
            if (
              axios.isAxiosError(e) &&
              e.response?.data?.error === "User not found"
            ) {
              console.warn(
                `Пользователь не найден в домене. Логин ${pass.employee.login}, esbId ${pass.employee.esbId}`,
              );
              pass.inVpnGroup = false;
              pass.notInGroupReason = `Пользователь ${pass.employee.login} не найден в домене`;
              await pass.save();
            } else throw e;
          }
        } else if (
          inGroupUsersLogins.includes(pass.employee.login) &&
          !pass.inVpnGroup
        ) {
          pass.inVpnGroup = true;
          await pass.save();
        }
      } catch (e: unknown) {
        log.err(
          `Ошибка при обработке разрешения на VPN с esbId ${pass.esbId}:`,
          e,
        );
        pass.inVpnGroup = false;
        if (e instanceof Error) pass.notInGroupReason = e.message;
        await pass.save();
      }
    }

    return added;
  }

  async function addToGroupByExclusions(
    inGroupLogins: string[],
    alwaysEnabled: VpnExclusion[],
  ): Promise<VpnExclusion[]> {
    log.debug("addToGroupByExclusions(...)");

    const added: VpnExclusion[] = [];

    for (const exclusion of alwaysEnabled) {
      try {
        if (!inGroupLogins.includes(exclusion.login)) {
          log.info(
            `Добавление в группу VPN пользователя ${exclusion.login} на основании списка исключений`,
          );
          await adService.addUserToVpnGroup({ login: exclusion.login });
          added.push(exclusion);
        }
      } catch (e: unknown) {
        log.err(
          `Не удалось добавить в группу VPN сотрудника с логином ${exclusion.login}`,
          e,
        );
      }
    }

    return added;
  }

  async function removeFromGroupByPasses(
    inGroupUsers: AdUser[],
    activeVpnPasses: HydratedDocument<VpnPassPopulated>[],
    alwaysEnabled: VpnExclusion[],
  ): Promise<AdUser[]> {
    log.debug("removeFromGroupByPasses(...)");

    const alwaysEnabledLogins: string[] = alwaysEnabled.map(
      (exclusion) => exclusion.login,
    );
    const passesLogins: string[] = [];

    activeVpnPasses.forEach((pass) => {
      if (pass.employee?.login) {
        passesLogins.push(pass.employee.login);
      }
    });

    const removed: AdUser[] = [];

    for (const adUser of inGroupUsers) {
      if (
        !passesLogins.includes(adUser.samAccountName) &&
        !alwaysEnabledLogins.includes(adUser.samAccountName)
      ) {
        log.info(
          `Удаление пользователя ${adUser.samAccountName} из группы VPN`,
        );
        try {
          await adService.removeUserFromVpnGroup({
            login: adUser.samAccountName,
          });
          removed.push(adUser);
        } catch (e: unknown) {
          log.err(
            `Не удалось удалить пользователя ${adUser.samAccountName} из группы VPN`,
            e,
          );
        }
      }
    }

    return removed;
  }

  async function removeFromGroupByExclusions(
    alwaysDisabled: VpnExclusion[],
    inGroupUsers: AdUser[],
  ): Promise<AdUser[]> {
    log.debug("removeFromGroupByExclusions(...)");

    const alwaysDisabledLogins: string[] = alwaysDisabled.map(
      (exclusion) => exclusion.login,
    );

    const removed: AdUser[] = [];

    for (const adUser of inGroupUsers) {
      if (alwaysDisabledLogins.includes(adUser.samAccountName)) {
        try {
          log.info(
            `Удаление из группы VPN пользователя с логином ${adUser.samAccountName}, на основании списка исключений`,
          );
          await adService.removeUserFromVpnGroup({
            login: adUser.samAccountName,
          });
          removed.push(adUser);
        } catch (e: unknown) {
          log.err(
            `Не удалось удалить пользователя ${adUser.samAccountName} из группы VPN`,
            e,
          );
        }
      }
    }

    return removed;
  }

  // #endregion
}

async function updateInGroupStatus(changes: VpnGroupChanges): Promise<void> {
  log.debug("updateInGroupStatus(...)");

  const addedLogins: string[] = changes.addedByExclusion.map(
    (exclusion) => exclusion.login,
  );
  const removedByExcl: string[] = changes.removedByExclusion.map(
    (user: AdUser) => user.samAccountName,
  );
  const removedByPasses: string[] = changes.removedByPasses.map(
    (user: AdUser) => user.samAccountName,
  );
  const removedLogins: string[] = [...removedByExcl, ...removedByPasses];

  const addedEmployees = await EmployeeModel.find({
    login: { $in: addedLogins },
  });
  await VpnPassModel.updateMany(
    { employee: { $in: addedEmployees } },
    { inVpnGroup: true },
  );

  const removedEmployees = await EmployeeModel.find({
    login: { $in: removedLogins },
  });
  await VpnPassModel.updateMany(
    { employee: { $in: removedEmployees } },
    { inVpnGroup: false },
  );
}

/**
 * Рассылает уведомление о изменении в группе VPN
 */
async function notifyVpnGroupChanged(changes: VpnGroupChanges): Promise<void> {
  log.debug("notifyVpnGroupChanged(...)");
  if (!isGroupChanged(changes)) {
    log.info(
      "Изменений в группе VPN не произошло, уведомление не будет отправлено",
    );
    return;
  }

  const subject = "Произошли изменения в группе VPN";
  const template = groupChangedTemplate;
  let tableRows = createRowsAddedByPasses(changes.addedByPasses);
  tableRows += createRowsAddedByExclusions(changes.addedByExclusion);
  tableRows += createRowsRemovedByPasses(changes.removedByPasses);
  tableRows += createRowsRemovedByExclusions(changes.removedByExclusion);

  const htmlBody = template.replace("{{placeholder}}", tableRows);
  log.info("Отправка уведомления о изменениях в группе VPN");

  await mailService.sendEmail(
    [appConfig.NOTIFICATION_EMAIL],
    subject,
    htmlBody,
  );
  return;

  // #region вспомогательные функции
  function isGroupChanged(changes: VpnGroupChanges): boolean {
    if (
      changes.addedByPasses.length === 0 &&
      changes.addedByExclusion.length === 0 &&
      changes.removedByPasses.length === 0 &&
      changes.removedByExclusion.length === 0
    ) {
      return false;
    } else {
      return true;
    }
  }

  function createRowsAddedByPasses(passes: VpnPassPopulated[]): string {
    const rows: string[] = [];

    passes.forEach((pass) => {
      const login = pass.employee?.login ? pass.employee?.login : "";
      const name = pass.employee ? getEmployeeFullName(pass.employee) : "";
      const companyName = pass.employee ? pass.employee.company.name : "";
      const department = pass.employee?.department
        ? pass.employee.department.name
        : "";
      const reason = `<a href="${appConfig.PORTAL_URL}/docflow/docs/show?id=${pass.doc}">Документ #${pass.doc}</a>`;

      const row = `
              <tr>
                  <td class="added">Добавлен</td>
                  <td>${login}</td>
                  <td>${name}</td>
                  <td>${companyName}</td>
                  <td>${department}</td>
                  <td>${reason}</td>
              </tr>
          `;

      rows.push(row);
    });

    return rows.join("");
  }

  function createRowsAddedByExclusions(exclusions: VpnExclusion[]): string {
    const rows: string[] = [];

    exclusions.forEach((exclusion) => {
      const row = `
              <tr>
                  <td class="added">Добавлен</td>
                  <td>${exclusion.login}</td>
                  <td>${exclusion.name}</td>
                  <td></td>
                  <td></td>
                  <td>Исключение - VPN включен всегда</td>
              </tr>
          `;

      rows.push(row);
    });

    return rows.join("");
  }

  function createRowsRemovedByPasses(adUsers: AdUser[]): string {
    const rows: string[] = [];

    adUsers.forEach((adUser) => {
      const row = `
              <tr>
                  <td class="removed">Удален</td>
                  <td>${adUser.samAccountName}</td>
                  <td>${adUser.name}</td>
                  <td></td>
                  <td></td>
                  <td>Нет активных разрешений на VPN</td>
              </tr>
          `;

      rows.push(row);
    });

    return rows.join("");
  }

  function createRowsRemovedByExclusions(adUsers: AdUser[]): string {
    const rows: string[] = [];

    adUsers.forEach((adUser) => {
      const row = `
              <tr>
                  <td class="removed">Удален</td>
                  <td>${adUser.samAccountName}</td>
                  <td>${adUser.name}</td>
                  <td></td>
                  <td></td>
                  <td>Исключение - VPN запрещен</td>
              </tr>
          `;

      rows.push(row);
    });

    return rows.join("");
  }
  // #endregion
}

export interface VpnGroupChanges {
  addedByPasses: VpnPassPopulated[];
  addedByExclusion: VpnExclusion[];
  removedByPasses: AdUser[];
  removedByExclusion: AdUser[];
}
