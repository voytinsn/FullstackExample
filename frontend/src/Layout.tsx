import { Outlet, Link, NavLink, useLoaderData } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { UserData } from "./services/authService";

export default function Layout() {
  const userData = useLoaderData() as UserData;

  return (
    <>
      <header className="p-3 mb-3 border-bottom">
        <div className="container">
          <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-lg-start">
            <Link
              to="/"
              className="d-flex align-items-center mb-2 mb-lg-0 text-dark text-decoration-none"
            >
              <img className="bi me-2" width="40" height="32" src="/vite.svg" />
            </Link>

            <ul className="nav col-12 col-lg-auto me-lg-auto mb-2 justify-content-center mb-md-0">
              <li>
                <NavLink
                  to="/vpn"
                  className={({ isActive }) =>
                    isActive
                      ? "nav-link px-2 link-secondary"
                      : "nav-link px-2 link-dark"
                  }
                >
                  VPN
                </NavLink>
              </li>
            </ul>
            <div>
              <div className="input-group">
                <span className="input-group-text">{userData.login}</span>
                <Link
                  to="/logout"
                  className="btn btn-outline-secondary"
                  type="button"
                >
                  <i className="bi bi-door-open"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        <Outlet />
      </div>

      <ToastContainer />
    </>
  );
}
