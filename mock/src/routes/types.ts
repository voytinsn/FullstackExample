import { z } from "zod";
import { esbGetChangesQueryZod } from "../utils/zodSchemas";

export enum Guides {
  VPN = 278, // Организация удаленного доступа (VPN)
  Employees = 1, // Сотрудники
  Companies = 9, // Предприятия
}

export type EsbGetChangesQuery = z.infer<typeof esbGetChangesQueryZod>;

export interface EsbPluralResponse<T> {
  code: 200;
  rows: T[];
  total_rows: number;
  total_pages: 1;
  current_page: 1;
  guide_revision: number;
  guide_version: number;
  meta: {
    next_link: null;
    prev_link: null;
  };
}

export interface EsbSingleResponse<T> {
  code: 200;
  row: T;
  guide_revision: number;
  guide_version: number;
  meta: {
    next_link: null;
    prev_link: null;
  };
}

interface EsbBaseRow {
  __id: number;
  __date_create: string;
  __date_modify: string;
  __guide_revision: number;
  __trash: boolean;
}

export interface EsbVpnRow extends EsbBaseRow {
  date_start: string;
  date_end: string;
  user: number;
  doc: number;
  archive: boolean;
}

export interface EsbCompanyRow extends EsbBaseRow {
  name: string;
  name_short: string;
}

export interface EsbDepartmentRow extends EsbBaseRow {
  uid: string;
  name: string;
  uid_parent: string;
  company: number;
}

export interface EsbPostRow extends EsbBaseRow {
  name: string;
}

export interface EsbIndividualRow extends EsbBaseRow {
  company: number;
  sex: "m" | "f";
  lastname: string;
  firstname: string;
  middlename: string;
}

export interface EsbEmployeeRow extends EsbBaseRow {
  company: EsbCompanyRow;
  department: EsbDepartmentRow;
  post: EsbPostRow;
  work_type: "main";
  date_begin: string;
  date_end: null;
  id_individual: EsbIndividualRow;
  office: true;
  login: string;
  email: null;
}

export interface AdUser {
    distinguishedName: string;
    name: string;
    emailAddress: string | null;
    enabled: true
    samAccountName: string;
    userPrincipalName: string;
    adminDescription: null,
}
