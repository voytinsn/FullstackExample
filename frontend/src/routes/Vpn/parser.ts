import { z } from "zod";
import { Gender, VpnExclusionTypes } from "./types";

export const companyZod = z.object({
  _id: z.string(),
  esbId: z.number(),
  name: z.string().min(1),
  nameShort: z.string().min(1),
});

export const departmentZod = z.object({
  esbId: z.number(),
  name: z.string(),
});

export const postZod = z.object({
  esbId: z.number(),
  name: z.string(),
});

export const individualZod = z.object({
  esbId: z.number(),
  sex: z.nativeEnum(Gender),
  lastname: z.string().min(1),
  firstname: z.string().min(1),
  middlename: z.string().nullish(),
});

export const employeeZod = z.object({
  esbId: z.number(),
  company: companyZod,
  department: departmentZod.nullish(),
  post: postZod.nullish(),
  individual: individualZod,
  login: z.string().nullish(),
  email: z.string().nullish(),
});

export const vpnPassPopulatedZod = z.object({
  _id: z.string(),
  esbId: z.number(),
  dateStart: z.coerce.date(),
  dateEnd: z.coerce.date(),
  employeeEsbId: z.number(),
  doc: z.number(),
  trash: z.boolean(),
  employee: employeeZod,
  inVpnGroup: z.boolean().nullish(),
  notInGroupReason: z.string().nullish(),
});

/**
 * Исключение из правил обработки VPN с объектом предприятия
 */
export const vpnExclusionPopulatedZod = z.object({
  _id: z.string(),
  login: z.string().min(1),
  name: z.string().min(1),
  type: z.nativeEnum(VpnExclusionTypes),
  company: companyZod,
  reason: z.string().nullish(),
});

/**
 * Исключение из правил обработки VPN со ссылкой на предприятие по id
 */
export const vpnExclusionZod = z.object({
  _id: z.string(),
  login: z.string().min(1),
  name: z.string().min(1),
  type: z.nativeEnum(VpnExclusionTypes),
  company: z.string(),
  reason: z.string().nullish(),
});

/**
 * Схема пользователя Active Directory
 */
export const adUserZod = z.object({
  distinguishedName: z.string().min(1),
  name: z.string().min(1),
  emailAddress: z.string().nullable(),
  enabled: z.boolean(),
  samAccountName: z.string().min(1),
  userPrincipalName: z.string().min(1),
  adminDescription: z.string().nullable(),
});
