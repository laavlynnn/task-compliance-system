import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Tasks() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/tasks", {
        params: {
          search: search || undefined,
          status: status || undefined,
          page,
        },
      });

      setTasks(response.data.data);
      setPagination(response.data.meta);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, search, status]);

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    setSearch(searchValue);
  };

  const handleDelete = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);

      await fetchTasks();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete task."
      );
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Tasks</h1>

          <p>
            {user?.role === "admin"
              ? "Manage and assign tasks."
              : "View your assigned tasks."}
          </p>
        </div>

        {user?.role === "admin" && (
          <Link
            to="/tasks/create"
            className="primary-button"
          >
            Create Task
          </Link>
        )}
      </div>

      <form
        className="filter-bar"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchValue}
          onChange={(event) =>
            setSearchValue(event.target.value)
          }
        />

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">
            All Status
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="In Progress">
            In Progress
          </option>

          <option value="Completed">
            Completed
          </option>

          <option value="Overdue">
            Overdue
          </option>
        </select>

        <button
          type="submit"
          className="primary-button"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading">
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          No tasks found.
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div
              className="task-card"
              key={task.id}
            >
              <div className="task-card-content">
                <div>
                  <h2>{task.title}</h2>

                  <p>{task.description}</p>

                  <p>
                    <strong>Deadline:</strong>{" "}
                    {new Date(
                      task.deadline
                    ).toLocaleDateString()}
                  </p>

                  {user?.role === "admin" &&
                    task.assigned_user && (
                      <p>
                        <strong>
                          Assigned to:
                        </strong>{" "}
                        {task.assigned_user.name}
                      </p>
                    )}
                </div>

                <span
                  className={`status status-${task.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {task.status}
                </span>
              </div>

              <div className="task-actions">
                <Link
                  to={`/tasks/${task.id}`}
                  className="secondary-button"
                >
                  View Details
                </Link>

                {user?.role === "admin" && (
                  <>
                    <Link
                      to={`/tasks/${task.id}/edit`}
                      className="secondary-button"
                    >
                      Edit
                    </Link>

                    <button
                      className="danger-button"
                      onClick={() =>
                        handleDelete(task.id)
                      }
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.last_page > 1 && (
        <div className="pagination">
          <button
            disabled={!pagination.prev_page_url}
            onClick={() =>
              setPage(page - 1)
            }
          >
            Previous
          </button>

          <span>
            Page {pagination.current_page} of{" "}
            {pagination.last_page}
          </span>

          <button
            disabled={!pagination.next_page_url}
            onClick={() =>
              setPage(page + 1)
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}