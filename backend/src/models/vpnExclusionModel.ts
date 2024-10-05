import { Schema, model, Types } from "mongoose";
import { z } from "zod";
import { log } from "../services/loggerService";
import { Company } from "./companyModel";

/**
 * Виды исключений правил доступа к VPN
 */
export enum VpnExclusionTypes {
  AlwaysEnabled = "alwaysEnabled",
  AlwaysDisabled = "alwaysDisabled",
}

/**
 * Zod схема исключения из правил обработки VPN
 */
export const NewVpnExclusionZod = z.object({
  login: z.string().min(1),
  name: z.string().min(1),
  type: z.nativeEnum(VpnExclusionTypes),
  company: z.string(),
  reason: z.string().optional(),
});

/**
 * Исключение из правил обработки VPN без _id
 */
export type NewVpnExclusion = z.infer<typeof NewVpnExclusionZod>;

/**
 * Исключение из правил обработки VPN
 */
export interface VpnExclusion {
  _id: Types.ObjectId;
  login: string;
  name: string;
  type: VpnExclusionTypes;
  company: Types.ObjectId;
  reason?: string;
}

/**
 * Исключение из правил обработки VPN с данными о предприятии
 */
export interface VpnExclusionPopulated extends Omit<VpnExclusion, "company"> {
  company: Company;
}

const vpnExclusionSchema = new Schema<VpnExclusion>({
  login: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  reason: { type: String },
  company: { type: Schema.Types.ObjectId, ref: "Company", required: true },
});

/**
 * Mongoose модель исключение из правил обработки VPN
 */
export const VpnExclusionModel = model<VpnExclusion>(
  "VpnExclusion",
  vpnExclusionSchema,
);

/**
 * Возвращает список логинов, соответствующих пользователей нельзя удалять из группы VPN
 */
export async function getAlwaysEnabledExclusions(): Promise<VpnExclusion[]> {
  log.debug("getAlwaysEnabledExclusions()");

  return await VpnExclusionModel.find({
    type: VpnExclusionTypes.AlwaysEnabled,
  }).lean();
}

/**
 * Возвращает список логинов, соответствующих пользователей нельзя добавлять в группу VPN
 */
export async function getAlwaysDisabledExclusions(): Promise<VpnExclusion[]> {
  log.debug("getAlwaysDisabledExclusions()");

  return await VpnExclusionModel.find({
    type: VpnExclusionTypes.AlwaysDisabled,
  }).lean();
}
