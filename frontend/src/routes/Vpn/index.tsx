import { NavLink, Outlet } from "react-router-dom";

export default function Vpn() {
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">VPN</h3>
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <NavLink
                end
                to="/vpn"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                По заявкам
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/vpn/exclusions"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                Исключения
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="card-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
