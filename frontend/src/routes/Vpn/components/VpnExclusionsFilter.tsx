import { useState, useEffect } from "react";
import { Company, VpnExclusionPopulated, VpnExclusionTypes } from "../types";

interface VpnExclusionsFilterProps {
  exclusions: VpnExclusionPopulated[];
  setFilteredExclusions: React.Dispatch<
    React.SetStateAction<VpnExclusionPopulated[]>
  >;
  companies: Company[];
}

export default function VpnExclusionsFilter(props: VpnExclusionsFilterProps) {
  const [filterName, setFilterName] = useState("");
  const [filterLogin, setFilterLogin] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCompany, setFilterCompany] = useState("");

  useEffect(() => {
    const filteredExclusions = getFilteredExclusions();
    props.setFilteredExclusions(filteredExclusions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterName, filterLogin, filterType, filterCompany, props.exclusions]);

  const getFilteredExclusions = () => {
    let filtered = [...props.exclusions];

    if (filterName.length >= 3) {
      filtered = filtered.filter((exclusion) =>
        exclusion.name.toLowerCase().includes(filterName.toLowerCase()),
      );
    }

    if (filterLogin.length >= 3) {
      filtered = filtered.filter((exclusion) =>
        exclusion.login.toLowerCase().includes(filterLogin.toLowerCase()),
      );
    }

    if (filterCompany !== "") {
      filtered = filtered.filter(
        (exclusion) => exclusion.company.esbId === parseInt(filterCompany),
      );
    }

    if (filterType !== "") {
      filtered = filtered.filter((exclusion) => exclusion.type === filterType);
    }

    filtered.sort((a, b) => {
      if (a.name > b.name) {
        return 1;
      } else if (a.name < b.name) {
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
              onChange={(v) => setFilterName(v.target.value)}
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

        <div className="col-3 mb-2">
          <label className="form-label">Предприятие</label>
          <div className="input-group input-group-sm">
            <select
              className="form-select"
              value={filterCompany}
              onChange={(v) => setFilterCompany(v.target.value)}
            >
              <option value="" key={0}>
                --
              </option>
              {props.companies.map((company) => (
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

      <div className="row">
        <div className="col-3 mb-2">
          <label className="form-label">Логин</label>
          <div className="input-group input-group-sm">
            <input
              type="text"
              className="form-control"
              value={filterLogin}
              onChange={(v) => setFilterLogin(v.target.value)}
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
        <div className="col-3 mb-2">
          <label className="form-label">Тип исключения</label>
          <div className="input-group input-group-sm">
            <select
              className="form-select"
              value={filterType}
              onChange={(v) => setFilterType(v.target.value)}
            >
              <option value="">--</option>
              <option value={VpnExclusionTypes.AlwaysDisabled}>
                Blacklist
              </option>
              <option value={VpnExclusionTypes.AlwaysEnabled}>Whitelist</option>
            </select>
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => setFilterType("")}
            >
              <i className="bi bi-x"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="row"></div>
    </div>
  );
}
