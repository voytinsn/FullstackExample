import { useState, CSSProperties } from "react";
import {
  AdUser,
  Company,
  NewVpnExclusion,
  VpnExclusionPopulated,
  VpnExclusionTypes,
} from "../types";
import { adUsersService } from "../../../services/adUsersService";
import AdUserRow from "./AdUserRow";
import { z } from "zod";
import { vpnPassesService } from "../../../services/vpnPassesService";
import { useRevalidator, useRouteLoaderData } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { UserData } from "../../../services/authService";

interface Params {
  companies: Company[];
  exclusions: VpnExclusionPopulated[];
}

export default function AddExclusionForm({ companies, exclusions }: Params) {
  const [loginsString, setLoginsString] = useState("");
  const [adUsers, setAdUsers] = useState<AdUser[]>([]);
  const [exclType, setExclType] = useState("");
  const [exclTypeInvalid, setExclTypeInvalid] = useState(false);
  const [exclCompany, setExclCompany] = useState("");
  const [exclCompanyInvalid, setExclCompanyInvalid] = useState(false);
  const [exclComment, setExclComment] = useState("");

  const userData = useRouteLoaderData("root") as UserData;

  const revalidator = useRevalidator();

  const resetState = (): void => {
    setLoginsString("");
    setAdUsers([]);
    setExclType("");
    setExclComment("");
    setExclTypeInvalid(false);
    setExclCompany("");
    setExclCompanyInvalid(false);
  };

  const exclTypeChanged = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setExclType(e.target.value);
    setExclTypeInvalid(false);
  };

  const companyChanged = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setExclCompany(e.target.value);
    setExclCompanyInvalid(false);
  };

  const checkLogins = async () => {
    const str = loginsString.replaceAll(" ", "").replaceAll("\n", ",");
    let logins: string[] = str.split(",").filter((v) => v !== "");

    // Удаление повторяющихся значений
    logins = [...new Set(logins)];

    // Удаление логинов, которые уже есть в списке исключений
    const exclusionsLogins = exclusions.map((excl) => excl.login);
    logins = logins.filter((l) => {
      if (!exclusionsLogins.includes(l)) {
        return true;
      } else {
        toast.info(`${l} уже есть в списке исключений`);
        return false;
      }
    });

    // Получение данных из AD
    const results: (AdUser | undefined)[] = await Promise.all(
      logins.map(async (login) => {
        if (!adUsers.map((adu) => adu.samAccountName).includes(login)) {
          const result: AdUser | null = await adUsersService.getAdUser(
            login,
            userData.token,
          );
          if (result) {
            return result;
          } else {
            toast.warn(`Пользователь с логином ${login} не найден в AD`);
          }
        }
      }),
    );

    const users = results.filter((v) => v !== undefined);
    const newAdUsers = adUsers.concat(...users);

    const adUsersLogins = newAdUsers.map((adu) => adu.samAccountName);
    setAdUsers(adUsers.concat(...users));

    setLoginsString(
      logins.filter((l) => !adUsersLogins.includes(l)).join(", "),
    );

    setAdUsers(newAdUsers);
  };

  const deleteUserCallback = (adUser: AdUser) => {
    setAdUsers(adUsers.filter((user) => user !== adUser));
  };

  const isAdUsers = (): boolean => {
    return adUsers.length > 0;
  };

  const getAddDivStyle = (): CSSProperties => {
    return { display: isAdUsers() ? "" : "none" };
  };

  const validate = (): boolean => {
    let result = true;

    if (exclType === "") {
      setExclTypeInvalid(true);
      result = false;
    }

    if (exclCompany === "") {
      setExclCompanyInvalid(true);
      result = false;
    }

    return result;
  };

  const addExclusions = async (): Promise<void> => {
    if (!validate()) return;

    try {
      for (const adUser of adUsers) {
        const newExcl: NewVpnExclusion = {
          login: adUser.samAccountName,
          name: adUser.name,
          company: exclCompany,
          type: z.nativeEnum(VpnExclusionTypes).parse(exclType),
          reason: exclComment !== "" ? exclComment : undefined,
        };

        await vpnPassesService.addVpnExclusion(newExcl, userData.token);
      }

      toast.success("Исключения добавлены");
      resetState();
      revalidator.revalidate();
    } catch (e: unknown) {
      console.log(e);
      if (axios.isAxiosError(e) && e.response?.data?.error?.message) {
        toast.error(`Произошла ошибка: ${e.response.data.error.message}`);
      } else {
        toast.error("Произошла ошибка");
      }
      revalidator.revalidate();
    }
  };

  return (
    <div>
      <button
        className="btn btn-success"
        data-bs-toggle="modal"
        data-bs-target="#addExclusionsModal"
      >
        Добавить исключение <i className="bi bi-plus-lg"></i>
      </button>

      <div
        className="modal fade"
        id="addExclusionsModal"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5" id="exampleModalLabel">
                Добавление исключений
              </h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Логины</label>
                <div className="row">
                  <div className="col">
                    <textarea
                      className="form-control"
                      id="exampleFormControlTextarea1"
                      rows={3}
                      placeholder="Введите логины разделяя запятой или переносом строки"
                      value={loginsString}
                      onChange={(e) => setLoginsString(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="col-auto">
                    <button
                      className="btn btn-outline-primary"
                      onClick={checkLogins}
                    >
                      Проверить логины
                    </button>
                  </div>
                </div>
              </div>
              <div>
                {adUsers.map((adUser) => (
                  <AdUserRow
                    key={adUser.samAccountName}
                    adUser={adUser}
                    deleteCallback={deleteUserCallback}
                  />
                ))}
              </div>
              <div className="border-top mt-3" style={getAddDivStyle()}>
                <div className="row align-items-end my-3">
                  <div className="col-4">
                    <label className="form-label">Тип исключения</label>
                    <select
                      className={
                        "form-select " + (exclTypeInvalid ? "is-invalid" : "")
                      }
                      value={exclType}
                      onChange={exclTypeChanged}
                    >
                      <option value="">--</option>
                      <option value={VpnExclusionTypes.AlwaysDisabled}>
                        Blacklist
                      </option>
                      <option value={VpnExclusionTypes.AlwaysEnabled}>
                        Whitelist
                      </option>
                    </select>
                  </div>
                  <div className="col-4">
                    <label className="form-label">Предприятие</label>
                    <select
                      className={
                        "form-select " +
                        (exclCompanyInvalid ? "is-invalid" : "")
                      }
                      value={exclCompany}
                      onChange={companyChanged}
                    >
                      <option value="">--</option>
                      {companies.map((val) => (
                        <option value={val._id} key={val._id}>
                          {val.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-4">
                    <label className="form-label">Комментарий</label>
                    <input
                      type="text"
                      className="form-control"
                      value={exclComment}
                      onChange={(v) => setExclComment(v.target.value)}
                      placeholder="Не обязательно"
                    />
                  </div>
                </div>
                <div>
                  <button className="btn btn-success" onClick={addExclusions}>
                    <span>Добавить исключения</span>
                    <i className="bi bi-plus-lg ms-1"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
