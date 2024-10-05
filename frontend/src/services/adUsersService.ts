import axios, { AxiosResponse } from "axios";
import { AdUser } from "../routes/Vpn/types";
import { adUserZod } from "../routes/Vpn/parser";

/**
 * Получает данные о пользователе AD по логину
 */
async function getAdUser(login: string, token: string): Promise<AdUser | null> {
  try {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const response: AxiosResponse = await axios.get(
      `/api/ad_users/${login}`,
      config,
    );
    const adUser: AdUser = adUserZod.parse(response.data);
    return adUser;
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      return null;
    } else {
      throw e;
    }
  }
}

export const adUsersService = {
  getAdUser,
};
