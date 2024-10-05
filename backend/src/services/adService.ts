import axios, { AxiosRequestConfig } from "axios";
import { appConfig } from "../utils/appConfig";
import { log } from "./loggerService";
import { z } from "zod";

const endpointVpnGroup = "VpnGroupMembers";
const endpointUsers = "users";

/**
 * Упрощенное представление пользователя в Active Directory
 */
export type AdUser = z.infer<typeof AdUserZod>;

/**
 * Сервис для работы с Active Directory
 */
export const adService = {
  getVpnGroupMembers,
  addUserToVpnGroup,
  removeUserFromVpnGroup,
  getAdUser,
};

// #region helpers
interface AdUserIdentity {
  esbId?: number;
  login?: string;
}

const AdUserZod = z.object({
  distinguishedName: z.string().min(1),
  name: z.string().min(1),
  emailAddress: z.string().nullable(),
  enabled: z.boolean(),
  samAccountName: z.string().min(1),
  userPrincipalName: z.string().min(1),
  adminDescription: z.string().nullable(),
});

const SuccessResponseZod = z.object({
  success: z.boolean(),
});
// #endregion helpers

// #region service methods

/**
 * Получает список членов группы VPN
 */
async function getVpnGroupMembers(): Promise<AdUser[]> {
  log.debug("getVpnGroupMembers()");

  const config: AxiosRequestConfig = {
    headers: {
      Authorization: appConfig.AD_GATEWAY_KEY,
    },
  };

  const responseRaw = await axios.get(
    `${appConfig.AD_GATEWAY_URL}/${endpointVpnGroup}`,
    config,
  );

  const vpnUsers: AdUser[] = z.array(AdUserZod).parse(responseRaw.data);
  return vpnUsers;
}

/**
 * Добавляет пользователя в группу VPN
 */
async function addUserToVpnGroup(userIdentity: AdUserIdentity): Promise<void> {
  log.debug("addUserToVpnGroup(...)", userIdentity);

  if (!userIdentity.esbId && !userIdentity.login)
    throw new Error("userIdentity не содержит ни esbId, ни логина");

  const config: AxiosRequestConfig = {
    headers: {
      Authorization: appConfig.AD_GATEWAY_KEY,
    },
  };

  const responseRaw = await axios.post(
    `${appConfig.AD_GATEWAY_URL}/${endpointVpnGroup}`,
    userIdentity,
    config,
  );

  const result = SuccessResponseZod.parse(responseRaw.data);
  if (!result.success) {
    throw new Error(
      `Не удалось добавить пользователя в группу. Данные пользователя: ${JSON.stringify(userIdentity)}`,
    );
  }
}

/**
 * Удаляет пользователя из группы VPN
 */
async function removeUserFromVpnGroup(
  userIdentity: AdUserIdentity,
): Promise<void> {
  log.debug("removeUserFromVpnGroup(...)", userIdentity);

  if (!userIdentity.esbId && !userIdentity.login)
    throw new Error("userIdentity не содержит ни esbId, ни логина");

  const config: AxiosRequestConfig = {
    headers: {
      Authorization: appConfig.AD_GATEWAY_KEY,
    },
  };

  if (userIdentity.esbId) {
    try {
      await removeByEsbId(userIdentity.esbId);
    } catch (e: unknown) {
      if (userIdentity.login) {
        await removeByEsbLogin(userIdentity.login);
      } else {
        throw e;
      }
    }
  } else if (userIdentity.login) {
    await removeByEsbLogin(userIdentity.login);
  }

  return;

  // #region helpers
  async function removeByEsbId(esbId: number) {
    await axios.delete(
      `${appConfig.AD_GATEWAY_URL}/${endpointVpnGroup}/${esbId}`,
      config,
    );
  }

  async function removeByEsbLogin(login: string) {
    await axios.delete(
      `${appConfig.AD_GATEWAY_URL}/${endpointVpnGroup}/${login}`,
      config,
    );
  }
  // #endregion helpers
}

/**
 * Получает данные о пользователе AD по логину
 */
async function getAdUser(login: string): Promise<AdUser | null> {
  log.debug(`getVpnGroupMembers(${login})`);

  const config: AxiosRequestConfig = {
    headers: {
      Authorization: appConfig.AD_GATEWAY_KEY,
    },
  };

  try {
    const responseRaw = await axios.get(
      `${appConfig.AD_GATEWAY_URL}/${endpointUsers}/${login}`,
      config,
    );
    const adUser: AdUser = AdUserZod.parse(responseRaw.data);
    return adUser;
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      return null;
    } else {
      throw e;
    }
  }
}
// #endregion service methods
