import axios, { AxiosResponse } from "axios";
import { z } from "zod";

/**
 * Получает данные о пользователе AD по логину
 */
async function authorize(login: string, password: string): Promise<UserData> {
  const response: AxiosResponse = await axios.post(`/api/login`, {
    login,
    password,
  });

  const userData: UserData = UserDataZ.parse(response.data);
  return userData;
}

export const UserDataZ = z.object({
  token: z.string().min(1),
  login: z.string().min(1),
  name: z.string().min(1),
});

export type UserData = z.infer<typeof UserDataZ>;

export const authService = {
  authorize,
};
