import {
  useLoaderData,
  useRevalidator,
  useRouteLoaderData,
} from "react-router-dom";
import { vpnPassesService } from "../../services/vpnPassesService";
import { Company, VpnExclusionPopulated, VpnExclusionTypes } from "./types";
import { ReactElement, useState } from "react";
import { companiesService } from "../../services/companiesService";
import AddExclusionForm from "./components/AddExclusionForm";
import { toast } from "react-toastify";
import { UserData } from "../../services/authService";
import { getUserData } from "../../helpers/authHelper";
import VpnExclusionsFilter from "./components/VpnExclusionsFilter";
import ButtonConfirmDelete from "./components/ButtonConfirmDelete";

export default function VpnExclusions() {
  const { exclusions, companies } = useLoaderData() as VpnExclusionsData;
  const [filteredExclusions, setFilteredExclusions] =
    useState<VpnExclusionPopulated[]>(exclusions);
  const userData = useRouteLoaderData("root") as UserData;
  const revalidator = useRevalidator();

  const prepareTypeCell = (exclusion: VpnExclusionPopulated): ReactElement => {
    let componentClass = "";
    if (exclusion.type === VpnExclusionTypes.AlwaysEnabled) {
      componentClass = "text-success";
    } else {
      componentClass = "text-danger";
    }

    return (
      <td className={componentClass}>
        {exclusion.type === VpnExclusionTypes.AlwaysEnabled
          ? "Whitelist"
          : "Blacklist"}
      </td>
    );
  };

  const deleteExclusion = async (
    exclusion: VpnExclusionPopulated,
  ): Promise<void> => {
    try {
      await vpnPassesService.deleteVpnExclusion(exclusion._id, userData.token);
      revalidator.revalidate();
      toast.success(`Пользователь ${exclusion.login} удален из исключений`);
    } catch (e) {
      console.log("Can't delete exclusion", e);
      toast.error("Произошла ошибка");
    }
  };

  return (
    <div>
      <div className="border-bottom mb-3">
        <VpnExclusionsFilter
          exclusions={exclusions}
          companies={companies}
          setFilteredExclusions={setFilteredExclusions}
        />

        <div className="ms-3 mb-3 mt-4">
          <AddExclusionForm companies={companies} exclusions={exclusions} />
        </div>
      </div>

      <table className="table table-sm">
        <thead>
          <tr>
            <th scope="col">Тип</th>
            <th scope="col">Логин</th>
            <th scope="col">ФИО</th>
            <th scope="col">Предприятие</th>
            <th scope="col">Комментарий</th>
            <th scope="col" style={{ width: "1%" }}></th>
          </tr>
        </thead>
        <tbody>
          {filteredExclusions.map((exclusion) => (
            <tr key={exclusion._id}>
              <>{prepareTypeCell(exclusion)}</>
              <td>{exclusion.login}</td>
              <td>{exclusion.name}</td>
              <td>{exclusion.company.name}</td>
              <td>{exclusion.reason}</td>
              <td>
                <ButtonConfirmDelete
                  headerText="Удаление исключения"
                  questionText={`Вы действительно хотите удалить исключение для ${exclusion.login}?`}
                  onConfirm={() => deleteExclusion(exclusion)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface VpnExclusionsData {
  exclusions: VpnExclusionPopulated[];
  companies: Company[];
}

export async function vpnExclusionsLoadData(): Promise<VpnExclusionsData> {
  const userData: UserData | null = getUserData();

  if (!userData) {
    throw new Error("No user data in local storage");
  }

  const exclusions: VpnExclusionPopulated[] =
    await vpnPassesService.getVpnExclusions(userData.token);

  const companies: Company[] = await companiesService.getCompanies(
    userData.token,
  );

  return { exclusions, companies };
}
