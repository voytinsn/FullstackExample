import { vpnPassesService } from "../../services/vpnPassesService";
import { VpnPassPopulated } from "./types";
import { useLoaderData } from "react-router-dom";
import { PORTAL_URL } from "../../consts";
import { ReactElement, useEffect, useState } from "react";
import { Tooltip } from "bootstrap";
import moment from "moment";
import { getUserData } from "../../helpers/authHelper";
import { UserData } from "../../services/authService";
import VpnListFilter from "./components/VpnListFilter";

/**
 * Список разрешений на VPN
 */
export default function VpnList() {
  const vpnPasses: VpnPassPopulated[] = useLoaderData() as VpnPassPopulated[];
  const [filteredPasses, setFilteredPasses] =
    useState<VpnPassPopulated[]>(vpnPasses);

  // Подготовка всплывающих подсказок
  useEffect(() => {
    const tooltipTriggerList = document.querySelectorAll(
      '[data-bs-toggle="tooltip"]',
    );
    [...tooltipTriggerList].forEach(
      (tooltipTriggerEl) => new Tooltip(tooltipTriggerEl),
    );
  });

  const prepareInGroupCell = (vpnPass: VpnPassPopulated): ReactElement => {
    let componentClass = "";
    if (vpnPass.inVpnGroup) {
      componentClass = "text-success";
    } else if (vpnPass.dateStart < new Date()) {
      componentClass = "text-danger";
    }

    return (
      <td className={componentClass}>
        {vpnPass.inVpnGroup ? "Да" : "Нет"}
        {vpnPass.notInGroupReason && (
          <i
            className="bi bi-exclamation-circle ms-2"
            data-bs-toggle="tooltip"
            data-bs-title={vpnPass.notInGroupReason}
            role="button"
          ></i>
        )}
      </td>
    );
  };

  return (
    <div>
      <div className="border-bottom mb-3">
        <VpnListFilter
          vpnPasses={vpnPasses}
          setFilteredPasses={setFilteredPasses}
        />
      </div>

      <table className="table table-sm">
        <thead>
          <tr>
            <th scope="col">В&nbsp;группе</th>
            <th scope="col">Логин</th>
            <th scope="col">ФИО</th>
            <th scope="col">Предприятие</th>
            <th scope="col">Отдел</th>
            <th scope="col">Дата начала</th>
            <th scope="col">Дата окончания</th>
            <th scope="col">Основание</th>
          </tr>
        </thead>
        <tbody>
          {filteredPasses.map((pass) => (
            <tr key={pass.esbId}>
              <>{prepareInGroupCell(pass)}</>
              <td>{pass.employee.login}</td>
              <td>{vpnPassesService.getEmployeeFullName(pass.employee)}</td>
              <td>{pass.employee.company.name}</td>
              <td>{pass.employee.department?.name}</td>
              <td>{moment(pass.dateStart).format("DD.MM.YYYY")}</td>
              <td>{moment(pass.dateEnd).format("DD.MM.YYYY")}</td>
              <td>
                <a
                  href={`${PORTAL_URL}/docflow/docs/show?id=${pass.doc}`}
                  target="blank"
                >
                  Документ #{pass.doc}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export async function vpnLoadData() {
  const userData: UserData | null = getUserData();

  if (!userData) {
    throw new Error("No user data in local storage");
  }

  const passes: VpnPassPopulated[] =
    await vpnPassesService.getUnexpiredVpnPasses(userData.token);
  return passes;
}
