import { z } from "zod";
import {
  adUserZod as AdUserSchemaZ,
  companyZod,
  employeeZod,
  vpnExclusionPopulatedZod,
  vpnExclusionZod,
  vpnPassPopulatedZod,
} from "./parser";

/**
 * Традиционный перечень полов
 */
export enum Gender {
  Male = "m",
  Female = "f",
}

/**
 * Сотрудник
 */
export type Employee = z.infer<typeof employeeZod>;

/**
 * Предприятие
 */
export type Company = z.infer<typeof companyZod>;

/**
 * Разрешение на VPN
 */
export type VpnPassPopulated = z.infer<typeof vpnPassPopulatedZod>;

/**
 * Исключение из правил VPN с данными о предприятии
 */
export type VpnExclusionPopulated = z.infer<typeof vpnExclusionPopulatedZod>;

/**
 * Типы исключений из правил обработки VPN
 */
export enum VpnExclusionTypes {
  AlwaysEnabled = "alwaysEnabled",
  AlwaysDisabled = "alwaysDisabled",
}

/**
 * Исключение из правил обработки VPN
 */
export type VpnExclusion = z.infer<typeof vpnExclusionZod>;

/**
 * Исключение из правил обработки VPN без Id
 */
export type NewVpnExclusion = Omit<VpnExclusion, "_id">;

/**
 * Пользователь ActiveDirectory
 */
export type AdUser = z.infer<typeof AdUserSchemaZ>;
