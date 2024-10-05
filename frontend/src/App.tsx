import {
  createBrowserRouter,
  createRoutesFromElements,
  LoaderFunctionArgs,
  redirect,
  Route,
  RouterProvider,
} from "react-router-dom";
import Vpn from "./routes/Vpn";
import Layout from "./Layout";
import VpnList, { vpnLoadData } from "./routes/Vpn/VpnList";
import VpnExclusions, {
  vpnExclusionsLoadData as vpnExclusionsLoadData,
} from "./routes/Vpn/VpnExclusions";
import LoginPage, { loginAction, loginLoader } from "./routes/LoginPage";
import { deleteUserData, getUserData } from "./helpers/authHelper";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path="/login"
        element={<LoginPage />}
        action={loginAction}
        loader={loginLoader}
      />
      <Route path="/" id="root" element={<Layout />} loader={requireAuth}>
        <Route
          index
          loader={() => {
            return redirect("/vpn");
          }}
        />
        <Route path="vpn" element={<Vpn />}>
          <Route index element={<VpnList />} loader={vpnLoadData} />
          <Route
            path="exclusions"
            element={<VpnExclusions />}
            loader={vpnExclusionsLoadData}
          />
        </Route>
        <Route path="logout" loader={logout} />
        <Route path="*" element={<div>Такой страницы нет</div>} />
      </Route>
    </>,
  ),
);

export default function App() {
  return <RouterProvider router={router} fallbackElement={<p>Loading...</p>} />;
}

/**
 * Переадресация на /login для неавторизованных пользователей
 */
function requireAuth({ request }: LoaderFunctionArgs) {
  const userData = getUserData();
  if (!userData) {
    const params = new URLSearchParams();
    params.set("from", new URL(request.url).pathname);
    return redirect("/login?" + params.toString());
  } else {
    return userData;
  }
}

function logout() {
  deleteUserData();
  return redirect("/login");
}
