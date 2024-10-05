import { z } from "zod";
import {
  vpnExclusionPopulatedZod,
  vpnExclusionZod,
  vpnPassPopulatedZod,
} from "../routes/Vpn/parser";
import {
  Employee,
  NewVpnExclusion,
  VpnExclusion,
  VpnExclusionPopulated,
  VpnPassPopulated,
} from "../routes/Vpn/types";
import axios, { AxiosResponse } from "axios";

/**
 * Получает список активных разрешений на VPN
 */
async function getUnexpiredVpnPasses(
  token: string,
): Promise<VpnPassPopulated[]> {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response: AxiosResponse = await axios.get("/api/vpn_passes", config);
  const vpnPasses = z.array(vpnPassPopulatedZod).parse(response.data);
  return vpnPasses;
}

/**
 * Получает список исключений VPN
 */
async function getVpnExclusions(
  token: string,
): Promise<VpnExclusionPopulated[]> {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response: AxiosResponse = await axios.get(
    "/api/vpn_exclusions",
    config,
  );
  const exclusions: VpnExclusionPopulated[] = z
    .array(vpnExclusionPopulatedZod)
    .parse(response.data);
  return exclusions;
}

/**
 * Добавляет в БД исключение VPN
 */
async function addVpnExclusion(
  excl: NewVpnExclusion,
  token: string,
): Promise<VpnExclusion> {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response: AxiosResponse = await axios.post(
    "/api/vpn_exclusions",
    excl,
    config,
  );
  const dbExcl: VpnExclusion = vpnExclusionZod.parse(response.data);
  return dbExcl;
}

/**
 * Удаляет из БД исключение VPN
 */
async function deleteVpnExclusion(id: string, token: string): Promise<void> {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  await axios.delete(`/api/vpn_exclusions/${id}`, config);
}

/**
 * Формирует строку с ФИО сотрудника
 */
function getEmployeeFullName(employee: Employee): string {
  const nameParts = [
    employee.individual.lastname,
    employee.individual.firstname,
  ];

  if (employee.individual.middlename) {
    nameParts.push(employee.individual.middlename);
  }

  return nameParts.join(" ");
}

export const vpnPassesService = {
  getUnexpiredVpnPasses,
  getVpnExclusions,
  addVpnExclusion,
  deleteVpnExclusion,
  getEmployeeFullName,
};
