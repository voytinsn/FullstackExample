import { z } from "zod";
import {
  EsbCompanyZod,
  EsbDepartmentZod,
  EsbEmployeeExtraZod,
  EsbIndividualZod,
  EsbNotificationZod,
  EsbPostZod,
  EsbRespPluralZod,
  EsbRespSingleZod,
  EsbVpnRowZod,
} from "./esbParser";

/**
 * Перечень используемых справочников в шине данных
 */
export enum Guides {
  VPN = 278, // Организация удаленного доступа (VPN)
  Employees = 1, // Сотрудники
  Companies = 9, // Предприятия
}

/**
 * Ответ от шины данных при запросе множества записей
 */
export type EsbRespPlural = z.infer<typeof EsbRespPluralZod>;

/**
 * Ответ от шины данных при запросе одной записи
 */
export type EsbRespSingle = z.infer<typeof EsbRespSingleZod>;

/**
 * Разрешение на VPN
 */
export type EsbVpn = z.infer<typeof EsbVpnRowZod>;

/**
 * Физическое лицо
 */
export type EsbIndividual = z.infer<typeof EsbIndividualZod>;

/**
 * Предприятие
 */
export type EsbCompany = z.infer<typeof EsbCompanyZod>;

/**
 * Должность
 */
export type EsbPost = z.infer<typeof EsbPostZod>;

/**
 * Подразделение
 */
export type EsbDepartment = z.infer<typeof EsbDepartmentZod>;

/**
 * Сотрудник со ссылками не другие сущности (должность, предприятие и т.д.)
 */
// export type EsbEmployee = z.infer<typeof EsbEmployeeSchema>;

/**
 * Сотрудник, содержит объекты других сущностей (должность, предприятие и т.д.)
 */
export type EsbEmployeeExtra = z.infer<typeof EsbEmployeeExtraZod>;

/**
 * Уведомлении от шины о изменении данных в справочнике
 */
export type EsbNotification = z.infer<typeof EsbNotificationZod>;
