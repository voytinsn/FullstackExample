import { useState, useEffect } from "react";
import { Company, VpnPassPopulated } from "../types";
import moment from "moment";
import { vpnPassesService } from "../../../services/vpnPassesService";

interface VpnListFilterProps {
  vpnPasses: VpnPassPopulated[];
  setFilteredPasses: React.Dispatch<React.SetStateAction<VpnPassPopulated[]>>;
}

/**
 * Фильтр списка разрешений на VPN
 */
export default function VpnListFilter(props: VpnListFilterProps) {
  const [filterName, setFilterName] = useState("");
  const [filterLogin, setFilterLogin] = useState("");
  const [filterDateStartFrom, setFilterDateStartFrom] = useState("");
  const [filterDateStartTo, setFilterDateStartTo] = useState("");
  const [filterDateEndFrom, setFilterDateEndFrom] = useState("");
  const [filterDateEndTo, setFilterDateEndTo] = useState("");
  const [filterCompany, setFilterCompany] = useState("");

  useEffect(() => {
    const filteredPasses = getFilteredPasses();
    props.setFilteredPasses(filteredPasses);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterName,
    filterLogin,
    filterDateStartFrom,
    filterDateStartTo,
    filterDateEndFrom,
    filterDateEndTo,
    filterCompany,
    props.vpnPasses,
  ]);

  const getCompanies = (): Company[] => {
    const companies = new Map<number, Company>();

    props.vpnPasses.forEach((pass) =>
      companies.set(pass.employee.company.esbId, pass.employee.company),
    );

    return Array.from(companies.values());
  };

  const getFilteredPasses = (): VpnPassPopulated[] => {
    let filtered = [...props.vpnPasses];
    if (filterName.length >= 3) {
      filtered = filtered.filter((pass) =>
        vpnPassesService
          .getEmployeeFullName(pass.employee)
          .toLowerCase()
          .includes(filterName.toLowerCase()),
      );
    }

    if (filterLogin.length >= 3) {
      filtered = filtered.filter((pass) =>
        pass.employee.login?.toLowerCase().includes(filterLogin.toLowerCase()),
      );
    }

    if (filterDateStartFrom !== "") {
      filtered = filtered.filter(
        (pass) => moment(pass.dateStart) >= moment(filterDateStartFrom),
      );
    }

    if (filterDateStartTo !== "") {
      filtered = filtered.filter(
        (pass) => moment(pass.dateStart) <= moment(filterDateStartTo),
      );
    }

    if (filterDateEndFrom !== "") {
      filtered = filtered.filter(
        (pass) => moment(pass.dateEnd) >= moment(filterDateEndFrom),
      );
    }

    if (filterDateEndTo !== "") {
      filtered = filtered.filter(
        (pass) => moment(pass.dateEnd) <= moment(filterDateEndTo),
      );
    }

    if (filterCompany !== "") {
      filtered = filtered.filter(
        (pass) => pass.employee.company.esbId === parseInt(filterCompany),
      );
    }

    filtered.sort((a, b) => {
      if (a.employee.individual.lastname > b.employee.individual.lastname) {
        return 1;
      } else if (
        a.employee.individual.lastname < b.employee.individual.lastname
      ) {
        return -1;
      } else {
        return 0;
      }
    });

    return filtered;
  };

  return (
    <div className="ms-3 mb-2">
      <h5 className="mb-3 mt-2">Фильтры</h5>
      <div className="row">
        <div className="col-3 mb-2">
          <label className="form-label">ФИО</label>
          <div className="input-group input-group-sm">
            <input
              type="text"
              className="form-control"
              value={filterName}
              onChange={(event) => setFilterName(event.target.value)}
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setFilterName("")}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        </div>
        <div className="col-5 mb-2">
          <label className="form-label">Дата начала</label>
          <div className="input-group input-group-sm">
            <span className="input-group-text">c</span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={filterDateStartFrom}
              onChange={(event) => setFilterDateStartFrom(event.target.value)}
            />
            <span className="input-group-text">по</span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={filterDateStartTo}
              onChange={(event) => setFilterDateStartTo(event.target.value)}
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => {
                setFilterDateStartFrom("");
                setFilterDateStartTo("");
              }}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-3 mb-2">
          <label className="form-label">Логин</label>
          <div className="input-group input-group-sm">
            <input
              type="text"
              className="form-control"
              value={filterLogin}
              onChange={(event) => setFilterLogin(event.target.value)}
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setFilterLogin("")}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        </div>
        <div className="col-5 mb-2">
          <label className="form-label">Дата окончания</label>
          <div className="input-group input-group-sm">
            <span className="input-group-text">c</span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={filterDateEndFrom}
              onChange={(event) => setFilterDateEndFrom(event.target.value)}
            />
            <span className="input-group-text">по</span>
            <input
              type="date"
              className="form-control form-control-sm"
              value={filterDateEndTo}
              onChange={(event) => setFilterDateEndTo(event.target.value)}
            />
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => {
                setFilterDateEndTo("");
              }}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <label className="form-label">Предприятие</label>
        <div className="col-3 mb-3">
          <div className="input-group input-group-sm">
            <select
              className="form-select"
              value={filterCompany}
              onChange={(event) => setFilterCompany(event.target.value)}
            >
              <option value="" key={0}>
                --
              </option>
              {getCompanies().map((company) => (
                <option value={company.esbId} key={company.esbId}>
                  {company.name}
                </option>
              ))}
            </select>
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setFilterCompany("")}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
