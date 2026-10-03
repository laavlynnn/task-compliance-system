import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    total_tasks: 0,
    completed_tasks: 0,
    pending_tasks: 0,
  });

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const dashboardResponse = await api.get("/dashboard");

        const tasksResponse = await api.get("/tasks", {
          params: {
            page: 1,
          },
        });

        setStats(dashboardResponse.data);
        setTasks((tasksResponse.data.data || []).slice(0, 5));
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const getStatusClass = (status) => {
    if (status === "Completed") {
      return "status-completed";
    }

    if (status === "In Progress") {
      return "status-progress";
    }

    if (status === "Overdue") {
      return "status-overdue";
    }

    return "status-pending";
  };

  const getRequirementProgress = (task) => {
    if (task.status === "Completed") {
      return 100;
    }

    const requirements = task.requirements || [];

    if (requirements.length === 0) {
      return 0;
    }

    const completed = requirements.filter((requirement) =>
      (requirement.submissions || []).some(
        (submission) => submission.status === "Verified"
      )
    ).length;

    return Math.round(
      (completed / requirements.length) * 100
    );
  };

  if (loading) {
    return (
      <div className="page">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page dashboard-page">
      <div className="dashboard-top">
        <div>
          <span className="dashboard-welcome">
            Welcome back 👋
          </span>

          <h1>{user?.name?.split(" ")[0]}</h1>

          <p>
            Here's an overview of your tasks and requirements.
          </p>
        </div>

        {user?.role === "admin" && (
          <Link
            to="/tasks/create"
            className="dashboard-create-button"
          >
            <span>＋</span>
            Create Task
          </Link>
        )}
      </div>

      {error && (
        <div className="dashboard-error">
          <span>!</span>
          {error}
        </div>
      )}

      <div className="dashboard-stats">
        <div className="dashboard-stat">
          <div className="dashboard-stat-icon blue">
            ☷
          </div>

          <div>
            <span>Total Tasks</span>
            <strong>{stats.total_tasks}</strong>
            <small>All assigned tasks</small>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat-icon green">
            ✓
          </div>

          <div>
            <span>Completed</span>
            <strong>{stats.completed_tasks}</strong>
            <small>Finished tasks</small>
          </div>
        </div>

        <div className="dashboard-stat">
          <div className="dashboard-stat-icon orange">
            ◷
          </div>

          <div>
            <span>Pending</span>
            <strong>{stats.pending_tasks}</strong>
            <small>Needs attention</small>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <section className="dashboard-card recent-card">
          <div className="dashboard-card-header">
            <div>
              <h2>Recent Tasks</h2>
              <p>Your latest task assignments</p>
            </div>

            <Link
              to="/tasks"
              className="view-all-link"
            >
              View all
            </Link>
          </div>

          {tasks.length === 0 ? (
            <div className="dashboard-empty">
              <div className="dashboard-empty-icon">
                ✓
              </div>

              <h3>No tasks yet</h3>

              <p>
                Tasks assigned to you will appear here.
              </p>

              {user?.role === "admin" && (
                <Link
                  to="/tasks/create"
                  className="dashboard-secondary-button"
                >
                  Create your first task
                </Link>
              )}
            </div>
          ) : (
            <div className="recent-task-list">
              {tasks.map((task) => {
                const progress =
                  getRequirementProgress(task);

                return (
                  <Link
                    key={task.id}
                    to={"/tasks/" + task.id}
                    className="recent-task"
                  >
                    <div className="recent-task-info">
                      <div className="recent-task-title">
                        <h3>{task.title}</h3>

                        <span
                          className={
                            "status-badge " +
                            getStatusClass(task.status)
                          }
                        >
                          {task.status}
                        </span>
                      </div>

                      <p>
                        {task.description ||
                          "No description provided."}
                      </p>

                      <div className="task-progress-row">
                        <div className="task-progress">
                          <div
                            className="task-progress-fill"
                            style={{
                              width: progress + "%",
                            }}
                          ></div>
                        </div>

                        <span>
                          {progress}% complete
                        </span>
                      </div>

                      <div className="recent-task-details">
                        <span>
                          📅{" "}
                          {new Date(
                            task.deadline
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>

                        <span>
                          {task.requirements?.length || 0}{" "}
                          requirements
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="dashboard-card overview-card">
          <div className="dashboard-card-header">
            <div>
              <h2>Task Overview</h2>
              <p>Current progress</p>
            </div>
          </div>

          <div className="overview-circle">
            <div className="overview-circle-inner">
              <strong>
                {stats.total_tasks > 0
                  ? Math.round(
                      (stats.completed_tasks /
                        stats.total_tasks) *
                        100
                    )
                  : 0}
                %
              </strong>

              <span>Complete</span>
            </div>
          </div>

          <div className="overview-items">
            <div className="overview-item">
              <span className="overview-dot completed"></span>

              <span>Completed</span>

              <strong>
                {stats.completed_tasks}
              </strong>
            </div>

            <div className="overview-item">
              <span className="overview-dot pending"></span>

              <span>Pending</span>

              <strong>
                {stats.pending_tasks}
              </strong>
            </div>

            <div className="overview-item">
              <span className="overview-dot total"></span>

              <span>Total</span>

              <strong>
                {stats.total_tasks}
              </strong>
            </div>
          </div>

          <div className="overview-message">
            <strong>
              {stats.total_tasks === 0
                ? "Ready to get started?"
                : stats.completed_tasks ===
                  stats.total_tasks
                ? "Great work! 🎉"
                : "Keep going! 💪"}
            </strong>

            <p>
              {stats.total_tasks === 0
                ? "Your task progress will appear here."
                : "Complete the required items to finish your tasks."}
            </p>
          </div>

          {user?.role === "admin" && (
            <div className="admin-actions">
              <h3>Quick Actions</h3>

              <Link
                to="/tasks/create"
                className="admin-action"
              >
                <span className="admin-action-icon">
                  ＋
                </span>

                <div>
                  <strong>Create Task</strong>
                  <small>
                    Assign a new task
                  </small>
                </div>
              </Link>

              <Link
                to="/users"
                className="admin-action"
              >
                <span className="admin-action-icon">
                  ♙
                </span>

                <div>
                  <strong>Manage Users</strong>
                  <small>
                    View and manage users
                  </small>
                </div>
              </Link>

              <Link
                to="/submissions"
                className="admin-action"
              >
                <span className="admin-action-icon">
                  ↥
                </span>

                <div>
                  <strong>Submissions</strong>
                  <small>
                    Review submitted requirements
                  </small>
                </div>
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}