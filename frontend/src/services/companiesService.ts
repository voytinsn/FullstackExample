import axios, { AxiosResponse } from "axios";
import { Company } from "../routes/Vpn/types";
import { companyZod } from "../routes/Vpn/parser";
import { z } from "zod";

/**
 * Получает список предприятий
 */
async function getCompanies(token: string): Promise<Company[]> {
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response: AxiosResponse = await axios.get("/api/companies", config);
  const vpnPasses = z.array(companyZod).parse(response.data);
  return vpnPasses;
}

export const companiesService = {
  getCompanies,
};
