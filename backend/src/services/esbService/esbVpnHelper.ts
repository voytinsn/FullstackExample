import { NewVpnPass, VpnPass, VpnPassModel } from "../../models/vpnPassModel";
import { EsbVpn, Guides } from "./esbTypes";
import { esbService } from ".";
import {
  getGuideRevision,
  setGuideRevision,
} from "../../models/guideRevisionModel";
import { EsbVpnRowZod } from "./esbParser";
import { log } from "../loggerService";
import { HydratedDocument } from "mongoose";

/**
 * На основании записи из шины данных
 * создает объект с требуемым для приложения
 * полями
 */
function esbRowToVpnPass(esbVpn: EsbVpn): NewVpnPass {
  log.debug("esbRowToVpnEntry(esbVpn: EsbVpn)");
  return {
    esbId: esbVpn.__id,
    dateStart: esbVpn.date_start,
    dateEnd: esbVpn.date_end,
    employeeEsbId: esbVpn.user,
    doc: esbVpn.doc,
    trash: esbVpn.__trash,
  };
}

/**
 * Валидирует и типизирует массив записей из справочника VPN.
 * В справочнике есть записи с непригодными для использования данными,
 * они будут отброшены при валидации.
 */
export function parseVpnRows(rows: unknown[]): EsbVpn[] {
  log.debug("parseVpnRows(rows: unknown[])");
  const result: EsbVpn[] = [];

  rows.forEach((row) => {
    const parseResult = EsbVpnRowZod.safeParse(row);
    if (parseResult.success) {
      result.push(parseResult.data);
    } else {
      log.warn(
        `Ошибка при парсинге данных из справочника ${Guides.VPN}. Исходные данные ${JSON.stringify(row)}`,
        parseResult.error,
      );
    }
  });

  return result;
}

/**
 * Получает и записывает изменения из справочника VPN в шине данных
 */
export async function pullVpnPasses(): Promise<HydratedDocument<VpnPass>[]> {
  log.debug("pullVpnEntries()");
  log.info(`Импорт изменений из справочника VPN`);

  // Получаем ревизию в которой находится локальная копия справочника
  const revision = await getGuideRevision(Guides.VPN);

  // Получаем изменения в справочнике из шины
  const esbResponse = await esbService.getFromRevRecurs(
    Guides.VPN,
    revision + 1,
  );
  const vpnRows = parseVpnRows(esbResponse.rows);
  const vpnPasses = vpnRows.map((row) => esbRowToVpnPass(row));

  // Записываем в БД изменения
  const dbVpnPasses: HydratedDocument<VpnPass>[] = [];

  for (const pass of vpnPasses) {
    const dbPass = await VpnPassModel.findOneAndUpdate(
      { esbId: pass.esbId },
      pass,
      { upsert: true, new: true },
    );

    if (dbPass) dbVpnPasses.push(dbPass);
  }

  // Записываем в БД номер ревизии справочника на момент обращения
  await setGuideRevision(Guides.VPN, esbResponse.guide_revision);

  log.info(
    `Результат импорта из справочника VPN:` +
      `\n Обработано:${esbResponse.rows.length}` +
      `\n Изменено:${vpnPasses.length}` +
      `\n Отброшено при валидации:${esbResponse.rows.length - vpnPasses.length}`,
  );
  return dbVpnPasses;
}
