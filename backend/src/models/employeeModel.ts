import { Schema, Types, model } from "mongoose";

/**
 * Виды занятости
 */
export enum EmployeeWorkTypes {
  Main = "main", // основное место работы
  External = "external", // внешний совместитель
  Internal = "internal", // внутренний совместитель
}

/**
 * Традиционный перечень гендеров
 */
export enum Gender {
  Male = "m",
  Female = "f",
}

/**
 * Сотрудник
 */
export interface Employee {
  _id: Types.ObjectId;
  esbId: number;
  company: {
    esbId: number;
    name: string;
    nameShort: string;
  };
  department?: {
    esbId: number;
    name: string;
  };
  post?: {
    esbId: number;
    name: string;
  };
  workType?: EmployeeWorkTypes;
  dateBegin?: Date;
  dateEnd?: Date;
  individual: {
    esbId: number;
    sex: Gender;
    lastname: string;
    firstname: string;
    middlename?: string;
  };
  office: boolean;
  login?: string;
  email?: string;
}

/**
 * Сотрудник без _id
 */
export type NewEmployee = Omit<Employee, "_id">;

const employeeSchema = new Schema<Employee>({
  esbId: { type: Number, required: true, unique: true },
  company: {
    type: {
      esbId: { type: Number, required: true },
      name: { type: String, required: true },
      nameShort: { type: String, required: true },
    },
    required: false,
  },
  department: {
    type: {
      esbId: { type: Number, required: true },
      name: { type: String, required: true },
    },
    required: false,
  },
  post: {
    type: {
      esbId: { type: Number, required: true },
      name: { type: String, required: true },
    },
    required: false,
  },
  workType: { type: String },
  dateBegin: { type: Date },
  dateEnd: { type: Date },
  individual: {
    type: {
      esbId: { type: Number, required: true },
      sex: { type: String, required: true },
      lastname: { type: String, required: true },
      firstname: { type: String, required: true },
      middlename: { type: String, required: true },
    },
    required: false,
  },
  office: { type: Boolean, required: true },
  login: { type: String },
  email: { type: String },
});

/**
 * Mongoose модель сотрудника
 */
export const EmployeeModel = model<Employee>("Employee", employeeSchema);

/**
 * Формирует строку с ФИО сотрудника
 */
export function getEmployeeFullName(employee: Employee): string {
  const nameParts = [
    employee.individual.lastname,
    employee.individual.firstname,
  ];

  if (employee.individual.middlename) {
    nameParts.push(employee.individual.middlename);
  }

  return nameParts.join(" ");
}
