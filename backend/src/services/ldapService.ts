import { appConfig } from "../utils/appConfig";
import { authenticate } from "ldap-authentication";
import { log } from "./loggerService";
import { z } from "zod";

export const ldapService = { auth };

// #region helpers

/**
 * Объект, который возвращает ldap-authentication
 * в случае успешной аутентификации
 */
export const LdapAuthResultZod = z.object({
  dn: z.string().min(1),
  name: z.string().min(1),
  sAMAccountName: z.string().min(1),
  groups: z.array(
    z.object({
      objectName: z.string().min(1),
    }),
  ),
});

export type LdapAuthResult = z.infer<typeof LdapAuthResultZod>;
// #endregion helpers

// #region service methods

/**
 * Авторизация через LDAP
 */
async function auth(
  login: string,
  password: string,
): Promise<LdapAuthResult | null> {
  log.debug(`ldapService.auth(login=${login}, password=****)`);

  const options = {
    ldapOpts: {
      url: `ldap://${appConfig.LDAP_SERVER}`,
    },
    adminDn: appConfig.LDAP_ADMIN_DN,
    adminPassword: appConfig.LDAP_ADMIN_PASSWORD,
    username: login,
    userPassword: password,
    userSearchBase: appConfig.LDAP_SEARCH_BASE,
    usernameAttribute: "sAMAccountName",
    groupsSearchBase: appConfig.LDAP_SEARCH_BASE,
    groupClass: "group",
    attributes: ["sAMAccountName", "name"],
  };

  try {
    const userRaw = await authenticate(options);
    const parsedUser = LdapAuthResultZod.parse(userRaw);
    return parsedUser;
  } catch (e) {
    if (
      e instanceof Error &&
      (e.name === "LdapAuthenticationError" ||
        e.name === "InvalidCredentialsError")
    ) {
      log.debug("Ошибка аутентификации", e);
      return null;
    } else {
      throw e;
    }
  }
}
// #endregion service methods
