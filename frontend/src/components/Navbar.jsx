import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((current) => !current);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">TC</div>

        <div className="brand-title">
          <h1>Task</h1>
          <span>Compliance</span>
        </div>

        <button
          type="button"
          className="theme-toggle"
          onClick={toggleDarkMode}
          aria-label={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          title={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      <div className="sidebar-section">
        <p className="sidebar-label">MENU</p>

        <nav className="sidebar-nav">
          <Link
            to="/dashboard"
            className={
              isActive("/dashboard")
                ? "nav-item active"
                : "nav-item"
            }
          >
            <span className="nav-icon">⌂</span>
            Dashboard
          </Link>

          <Link
            to="/tasks"
            className={
              isActive("/tasks") &&
              !isActive("/tasks/create")
                ? "nav-item active"
                : "nav-item"
            }
          >
            <span className="nav-icon">☷</span>
            Tasks
          </Link>

          {user?.role === "admin" && (
            <>
              <Link
                to="/users"
                className={
                  isActive("/users")
                    ? "nav-item active"
                    : "nav-item"
                }
              >
                <span className="nav-icon">♙</span>
                Users
              </Link>

              <Link
                to="/submissions"
                className={
                  isActive("/submissions")
                    ? "nav-item active"
                    : "nav-item"
                }
              >
                <span className="nav-icon">↥</span>
                Submissions
              </Link>
            </>
          )}

          <Link
            to="/settings"
            className={
              isActive("/settings")
                ? "nav-item active"
                : "nav-item"
            }
          >
            <span className="nav-icon">⚙</span>
            Settings
          </Link>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="profile-card">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="profile-info">
            <strong>{user?.name}</strong>

            <span>
              {user?.role === "admin"
                ? "Administrator"
                : "User"}
            </span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          <span>↪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}