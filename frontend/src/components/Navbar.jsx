import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/dashboard">
          Task Compliance
        </Link>
      </div>

      <div className="nav-links">
        <Link to="/dashboard">
          Dashboard
        </Link>

        <Link to="/tasks">
          Tasks
        </Link>

        {user?.role === "admin" && (
          <>
            <Link to="/users">
              Users
            </Link>

            <Link to="/submissions">
              Submissions
            </Link>
          </>
        )}

        <span className="user-name">
          {user?.name}
        </span>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}