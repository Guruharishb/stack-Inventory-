import React from "react";
import { useNavigate } from "react-router-dom";
import { getUser, clearSession } from "../utils/auth";
import "./AppLayout.css";

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const user = getUser();

  const logout = () => {
    clearSession();
    navigate("/");
  };

  // Menu configuration based on roles
  const menuItems = [
    { label: "Dashboard", path: "/owner", roles: ["owner"] },
    { label: "Stock", path: "/purchase", roles: ["owner"] },
    { label: "Billing", path: "/billing", roles: ["owner", "employee"] },
    { label: "Sales", path: "/sales", roles: ["owner", "employee"] },
    { label: "Employees", path: "/employee", roles: ["owner"] },
    
  ];

  return (
    <div className="app-root">
      <aside className="app-sidebar">
        <div className="brand">Olympic Printers</div>

        <nav className="nav">
          {menuItems
            .filter((item) => item.roles.includes(user?.role))
            .map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="nav-link"
              >
                {item.label}
              </button>
            ))}
        </nav>

        <div className="sidebar-footer">
          <div className="small">Signed in as</div>
          <div className="user-name">{user?.name || user?.email}</div>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <div className="header-left">
            Welcome — <strong>{user?.name || user?.email}</strong>
          </div>
          <div className="header-right">
            {user?.role === "owner" ? "Owner Portal" : "Employee Portal"}
          </div>
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
