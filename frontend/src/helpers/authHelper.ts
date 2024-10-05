import { UserData, UserDataZ } from "../services/authService";

/**
 * Извлекает из localStorage данные о пользователе,
 * в том числе JWT токен
 */
export function getUserData(): UserData | null {
  const userDataRaw = window.localStorage.getItem("userData");

  if (!userDataRaw) {
    return null;
  }

  const userData: UserData = UserDataZ.parse(JSON.parse(userDataRaw));
  return userData;
}

/**
 * Записывает в localStorage данные о пользователе
 */
export function setUserData(userData: UserData): void {
  window.localStorage.setItem("userData", JSON.stringify(userData));
}

/**
 * Удаляет из localStorage данные о пользователе
 */
export function deleteUserData(): void {
  window.localStorage.removeItem("userData");
}
