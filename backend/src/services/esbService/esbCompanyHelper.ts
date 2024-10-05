import { HydratedDocument } from "mongoose";
import { Company, CompanyModel, NewCompany } from "../../models/companyModel";
import { log } from "../loggerService";
import {
  getGuideRevision,
  setGuideRevision,
} from "../../models/guideRevisionModel";
import { EsbCompany, Guides } from "./esbTypes";
import { esbService } from ".";
import { EsbCompanyZod } from "./esbParser";

/**
 * Получает и записывает изменения из справочника Предприятия в шине данных
 */
export async function pullCompanies(): Promise<HydratedDocument<Company>[]> {
  log.debug("pullCompanies()");
  log.info(`Импорт изменений из справочника Предприятия`);

  // Получаем ревизию в которой находится локальная копия справочника
  const revision = await getGuideRevision(Guides.Companies);

  // Получаем изменения в справочнике из шины
  const esbResponse = await esbService.getFromRevRecurs(
    Guides.Companies,
    revision + 1,
  );
  const vpnRows = parseCompaniesRows(esbResponse.rows);
  const companies: NewCompany[] = vpnRows.map((row) => esbRowToCompany(row));

  // Записываем в БД изменения
  const dbCompanies: HydratedDocument<Company>[] = [];

  for (const company of companies) {
    const dbPass = await CompanyModel.findOneAndUpdate(
      { esbId: company.esbId },
      company,
      { upsert: true, new: true },
    );

    if (dbPass) dbCompanies.push(dbPass);
  }

  // Записываем в БД номер ревизии справочника на момент обращения
  await setGuideRevision(Guides.Companies, esbResponse.guide_revision);

  log.info(
    `Результат импорта из справочника Предприятия:` +
      `\n Обработано:${esbResponse.rows.length}` +
      `\n Изменено:${dbCompanies.length}` +
      `\n Отброшено при валидации:${esbResponse.rows.length - dbCompanies.length}`,
  );
  return dbCompanies;
}

/**
 * На основании записи из шины данных
 * создает объект с требуемым для приложения
 * полями
 */
function esbRowToCompany(esbCompany: EsbCompany): NewCompany {
  log.debug("esbRowToCompany(...)");
  return {
    esbId: esbCompany.__id,
    name: esbCompany.name,
    nameShort: esbCompany.name_short,
  };
}

/**
 * Валидирует и типизирует массив записей из справочника Предприятия.
 */
export function parseCompaniesRows(rows: unknown[]): EsbCompany[] {
  log.debug("parseCompaniesRows(...)");
  const result: EsbCompany[] = [];

  rows.forEach((row) => {
    const parseResult = EsbCompanyZod.safeParse(row);
    if (parseResult.success) {
      result.push(parseResult.data);
    } else {
      log.warn(
        `Ошибка при парсинге данных из справочника ${Guides.Companies}. Исходные данные ${JSON.stringify(row)}`,
        parseResult.error,
      );
    }
  });

  return result;
}
