import { Router, Response } from "express";
import { ldapService } from "../services/ldapService";
import { LdapAuthResult } from "../services/ldapService";
import { z } from "zod";
import { HttpStatusCode } from "axios";
import jsonwebtoken from "jsonwebtoken";
import { appConfig } from "../utils/appConfig";

export const loginRouter = Router();

/**
 * Авторизация и получение JWT
 */
loginRouter.post(
  "/",
  async (
    req,
    res: Response<AuthorizedJWTResponse | UnauthorizedResponse>,
    next,
  ) => {
    const { login, password } = z
      .object({
        login: z.string().min(1),
        password: z.string().min(1),
      })
      .parse(req.body);

    // В демо режиме можно "авторизоваться" с любым логином и паролем
    if (process.env.NODE_ENV === "demo") {
      const jwtPayload = {
        login: login,
        name: login,
      };

      const token: string = jsonwebtoken.sign(jwtPayload, appConfig.JWT_SECRET);
      return res.json({ token, login: login, name: login });
    }

    try {
      // Попытка LDAP авторизации
      const user: LdapAuthResult | null = await ldapService.auth(
        login,
        password,
      );

      if (!user) {
        return res
          .status(HttpStatusCode.Unauthorized)
          .json({ error: "Invalid login or password" });
      }

      // Проверка принадлежности к разрешенным группам
      let inAllowedGroup = false;
      user.groups.forEach((group) => {
        appConfig.LDAP_ALLOWED_GROUPS.forEach((confGroup) => {
          if (group.objectName.includes(confGroup)) {
            inAllowedGroup = true;
          }
        });
      });

      if (!inAllowedGroup) {
        return res
          .status(HttpStatusCode.Unauthorized)
          .json({ error: "Is not a member of any of the permitted groups" });
      }

      // Формирование и отправка JWT
      const jwtPayload = {
        login: user.sAMAccountName,
        name: user.name,
      };

      const token: string = jsonwebtoken.sign(jwtPayload, appConfig.JWT_SECRET);
      return res.json({ token, login: user.sAMAccountName, name: user.name });
    } catch (e) {
      next(e);
    }
  },
);

interface AuthorizedJWTResponse {
  token: string;
  login: string;
  name: string;
}

interface UnauthorizedResponse {
  error: string;
}
