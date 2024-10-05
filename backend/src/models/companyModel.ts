import { Schema, model, Types } from "mongoose";

export interface Company {
  _id: Types.ObjectId;
  esbId: number;
  name: string;
  nameShort: string;
}

export type NewCompany = Omit<Company, "_id">;

const companySchema = new Schema<Company>({
  esbId: { type: Number, required: true },
  name: { type: String, required: true },
  nameShort: { type: String, required: true },
});

/**
 * Mongoose model предприятия
 */
export const CompanyModel = model<Company>("Company", companySchema);
