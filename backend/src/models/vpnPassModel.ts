import { Schema, model, Types } from "mongoose";
import { Employee } from "./employeeModel";

/**
 * Разрешение на VPN
 */
export interface VpnPass {
  _id: Types.ObjectId;
  esbId: number;
  dateStart: Date;
  dateEnd: Date;
  employeeEsbId: number;
  doc: number;
  trash: boolean;
  employee?: Types.ObjectId;
  inVpnGroup?: boolean;
  notInGroupReason?: string;
}

/**
 * Разрешение на VPN без _id
 */
export type NewVpnPass = Omit<VpnPass, "_id">;

export interface VpnPassPopulated extends Omit<VpnPass, "employee"> {
  employee?: Employee;
}

const vpnPassSchema = new Schema<VpnPass>({
  esbId: { type: Number, required: true, unique: true },
  dateStart: { type: Date, required: true },
  dateEnd: { type: Date, required: true },
  employeeEsbId: { type: Number, required: true },
  doc: { type: Number, required: true },
  trash: { type: Boolean, required: true, default: false },
  employee: { type: Schema.Types.ObjectId, ref: "Employee" },
  inVpnGroup: { type: Boolean },
  notInGroupReason: { type: String },
});

/**
 * Mongoose model разрешения на VPN
 */
export const VpnPassModel = model<VpnPass>("VpnPass", vpnPassSchema);
