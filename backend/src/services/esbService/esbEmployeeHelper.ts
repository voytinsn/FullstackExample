import { EsbEmployeeExtra, EsbRespSingle, Guides } from "./esbTypes";
import { esbService } from ".";
import { EsbEmployeeExtraZod } from "./esbParser";
import { NewEmployee } from "../../models/employeeModel";
import { log } from "../loggerService";

/**
 * На основании записи из шины данных
 * создает объект с требуемым для приложения
 * полями
 */
function esbRowToEmployee(esbEmployee: EsbEmployeeExtra): NewEmployee {
  log.debug("esbRowToEmployee(esbEmployee: EsbEmployeeExtra)");

  const department = esbEmployee.department
    ? {
        esbId: esbEmployee.department.__id,
        name: esbEmployee.department.name,
      }
    : undefined;

  const post = esbEmployee.post
    ? {
        esbId: esbEmployee.post.__id,
        name: esbEmployee.post.name,
      }
    : undefined;

  return {
    esbId: esbEmployee.__id,
    company: {
      esbId: esbEmployee.company.__id,
      name: esbEmployee.company.name,
      nameShort: esbEmployee.company.name_short,
    },
    department: department,
    post: post,
    workType: esbEmployee.work_type ? esbEmployee.work_type : undefined,
    dateBegin: esbEmployee.date_begin ? esbEmployee.date_begin : undefined,
    dateEnd: esbEmployee.date_end ? esbEmployee.date_end : undefined,
    individual: {
      esbId: esbEmployee.id_individual.__id,
      sex: esbEmployee.id_individual.sex,
      lastname: esbEmployee.id_individual.lastname,
      firstname: esbEmployee.id_individual.firstname,
      middlename: esbEmployee.id_individual.middlename
        ? esbEmployee.id_individual.middlename
        : undefined,
    },
    office: esbEmployee.office ? true : false,
    login: esbEmployee.login ? esbEmployee.login : undefined,
    email: esbEmployee.email ? esbEmployee.email : undefined,
  };
}

/**
 * Получает из шины данные о сотруднике
 */
export async function getEmployeeExtraByEsbId(
  employeeEsbId: number,
): Promise<NewEmployee> {
  log.debug(`getEmployeeExtraByEsbId(employeeEsbId=${employeeEsbId})`);

  const esbResponse: EsbRespSingle = await esbService.getByEsbId(
    Guides.Employees,
    employeeEsbId,
  );

  const esbEmployee = EsbEmployeeExtraZod.parse(esbResponse.row);
  const employee: NewEmployee = esbRowToEmployee(esbEmployee);
  return employee;
}
