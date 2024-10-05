import {
  Form,
  LoaderFunctionArgs,
  useActionData,
  useLocation,
  useNavigation,
  redirect,
} from "react-router-dom";
import { authService, UserData } from "../services/authService";
import { getUserData, setUserData } from "../helpers/authHelper";

export default function LoginPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const from = params.get("from") || "/";

  const navigation = useNavigation();
  const isLoggingIn = navigation.formData?.get("username") != null;

  const actionData = useActionData() as { error: string } | undefined;

  return (
    <div className="position-absolute top-50 start-50 translate-middle container">
      <div className="row justify-content-md-center">
        <div className="col-3">
          <Form method="post">
            <div className="d-flex flex-column align-items-center mb-4">
              <img
                className="mb-4"
                src="/vite.svg"
                alt=""
                width="72"
                height="72"
              />
              <h1 className="h3 fw-normal">Авторизация</h1>
            </div>

            <div className="form-floating mb-2">
              <input
                type="text"
                name="login"
                className="form-control"
                id="floatingInput"
                placeholder="Логин"
              />
              <label htmlFor="floatingInput">Логин</label>
            </div>

            <div className="form-floating mb-4">
              <input
                type="password"
                name="password"
                className="form-control"
                id="floatingPassword"
                placeholder="Пароль"
              />
              <label htmlFor="floatingPassword">Пароль</label>
            </div>

            {actionData && actionData.error ? (
              <p style={{ color: "red" }}>{actionData.error}</p>
            ) : null}

            <button
              className="btn btn-primary w-100 py-2"
              type="submit"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Вход..." : "Войти"}
            </button>

            <input type="hidden" name="redirectTo" value={from} />
          </Form>
        </div>
      </div>
    </div>
  );
}

export async function loginLoader() {
  if (getUserData()) {
    return redirect("/");
  }
  return null;
}

export async function loginAction({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const login = formData.get("login") as string | null;
  const password = formData.get("password") as string | null;

  // Validate our form inputs and return validation errors via useActionData()
  if (!login || !password) {
    return {
      error: "Введите логин и пароль",
    };
  }

  // Sign in and redirect to the proper destination if successful.
  try {
    const userData: UserData = await authService.authorize(login, password);
    setUserData(userData);
    const redirectTo = formData.get("redirectTo") as string | null;
    return redirect(redirectTo || "/");
  } catch (e) {
    console.log("Ошибка при авторизации", e);
    // Unused as of now but this is how you would handle invalid
    // username/password combinations - just like validating the inputs
    // above
    return {
      error: "Invalid login attempt",
    };
  }
}
