import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard")
      .then((response) => {
        setStats(response.data);
      })
      .catch(() => {
        setError("Unable to load dashboard.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="page">
      <h1>Dashboard</h1>

      <p className="welcome">
        Welcome, {user?.name}!
      </p>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <strong>{stats.total_tasks}</strong>
        </div>

        <div className="stat-card">
          <h3>Completed Tasks</h3>
          <strong>{stats.completed_tasks}</strong>
        </div>

        <div className="stat-card">
          <h3>Pending Tasks</h3>
          <strong>{stats.pending_tasks}</strong>
        </div>
      </div>

      <div className="dashboard-info">
        <h2>
          {user?.role === "admin"
            ? "Administrator"
            : "User"}
        </h2>

        <p>
          {user?.role === "admin"
            ? "Manage users, tasks, requirements, and submissions."
            : "View your assigned tasks and submit requirements."}
        </p>
      </div>
    </div>
  );
}