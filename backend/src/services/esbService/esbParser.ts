import { z } from "zod";
import { EmployeeWorkTypes, Gender } from "../../models/employeeModel";
import { EsbDepartment, EsbPost, Guides } from "./esbTypes";
import moment from "moment";

/**
 * Схема ответа от шины данных
 */
export const EsbRespPluralZod = z.object({
  code: z.number(),
  rows: z.array(z.unknown()),
  total_rows: z.number(),
  total_pages: z.number(),
  current_page: z.number(),
  guide_revision: z.number(),
  guide_version: z.number(),
  meta: z.object({
    next_link: z.string().nullable(),
    prev_link: z.string().nullable(),
  }),
});

export const EsbRespSingleZod = z.object({
  code: z.number(),
  row: z.unknown(),
  guide_revision: z.number(),
  guide_version: z.number(),
});

/**
 * Общий для всех справочников набор полей
 */
const EsbBaseRowZod = z.object({
  __id: z.number(),
  __date_create: z.string().refine(isDatetime).transform(strToDatetime),
  __date_modify: z.string().refine(isDatetime).transform(strToDatetime),
  __guide_revision: z.number(),
  __trash: z.boolean(),
});

/**
 * Схема записи в справочнике VPN
 */
export const EsbVpnRowZod = EsbBaseRowZod.extend({
  date_start: z.string().refine(isDatetime).transform(strToDatetime),
  date_end: z.string().refine(isDatetime).transform(strToDatetime),
  user: z.number().min(1),
  doc: z.number().min(1),
  archive: z.boolean().nullable(),
});

/**
 * Схема записи в справочнике предприятий
 */
export const EsbCompanyZod = EsbBaseRowZod.extend({
  name: z.string(),
  name_short: z.string(),
});

/**
 * Схема записи в справочнике подразделений
 */
export const EsbDepartmentZod = EsbBaseRowZod.extend({
  uid: z.string(),
  name: z.string(),
  uid_parent: z.string(),
  company: z.number(),
});

/**
 * Схема записи в справочнике должностей
 */
export const EsbPostZod = EsbBaseRowZod.extend({
  name: z.string(),
  company: z.number(),
});

/**
 * Схема записи в справочнике физических лиц
 */
export const EsbIndividualZod = EsbBaseRowZod.extend({
  company: z.number(),
  sex: z.nativeEnum(Gender),
  lastname: z.string().min(1),
  firstname: z.string().min(1),
  middlename: z.string().min(1).nullable(),
});

/**
 * Схема записи в справочнике сотрудников содержащей связанные сущности
 */
export const EsbEmployeeExtraZod = EsbBaseRowZod.extend({
  company: EsbCompanyZod,
  department: z.unknown().transform(toDepartmentOrNull).nullable(),
  post: z.unknown().transform(toPostOrNull).nullable(),
  work_type: z.string().transform(strToWorkTypeOrNull).nullable(),
  date_begin: z.string().refine(isDatetime).transform(strToDatetime).nullable(),
  date_end: z.string().refine(isDatetime).transform(strToDatetime).nullable(),
  id_individual: EsbIndividualZod,
  office: z.boolean().nullable(),
  login: z.string().nullable(),
  email: z.string().nullable(),
});

/**
 * Схема уведомления о изменении данных в справочнике
 */
export const EsbNotificationZod = z.object({
  message: z.literal("GUIDE_UPDATED"),
  guide: z.nativeEnum(Guides),
  new_revision: z.number(),
});

//#region helpers
function isDatetime(datetime: string): boolean {
  return moment(datetime).isValid();
}

function strToDatetime(datetime: string): Date {
  return moment(datetime).toDate();
}

function isWorkType(workType: string): boolean {
  return z.nativeEnum(EmployeeWorkTypes).safeParse(workType).success;
}

function isDepartment(val: unknown): boolean {
  return EsbDepartmentZod.safeParse(val).success;
}

function isPost(val: unknown): boolean {
  return EsbPostZod.safeParse(val).success;
}

function strToWorkTypeOrNull(workType: string): EmployeeWorkTypes | null {
  return isWorkType(workType)
    ? z.nativeEnum(EmployeeWorkTypes).parse(workType)
    : null;
}

function toDepartmentOrNull(val: unknown): EsbDepartment | null {
  return isDepartment(val) ? EsbDepartmentZod.parse(val) : null;
}

function toPostOrNull(val: unknown): EsbPost | null {
  return isPost(val) ? EsbPostZod.parse(val) : null;
}
//#endregion helpers
