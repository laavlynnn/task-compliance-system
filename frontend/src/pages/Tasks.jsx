import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Tasks() {
  const { user } = useAuth();

  const [activeStatus, setActiveStatus] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const statusOptions = [
    {
      key: "all",
      title: "All Tasks",
      description: "View all your assigned tasks.",
      icon: "📋",
    },
    {
      key: "Pending",
      title: "Pending",
      description: "Tasks that have not been started yet.",
      icon: "🕐",
    },
    {
      key: "In Progress",
      title: "In Progress",
      description: "Tasks that are currently being worked on.",
      icon: "🔄",
    },
    {
      key: "Completed",
      title: "Completed",
      description: "Tasks that have already been finished.",
      icon: "✓",
    },
    {
      key: "Overdue",
      title: "Overdue",
      description: "Tasks that have passed their deadline.",
      icon: "⚠",
    },
  ];

  useEffect(() => {
    if (!activeStatus) {
      return;
    }

    const loadTasks = async () => {
      try {
        setLoading(true);
        setError("");

        const firstResponse = await api.get("/tasks", {
          params: { page: 1, per_page: 100 },
        });

        const allTasks = [...(firstResponse.data.data || [])];
        const lastPage = Math.min(firstResponse.data.meta?.last_page || 1, 100);

        for (let nextPage = 2; nextPage <= lastPage; nextPage += 1) {
          const pageResponse = await api.get("/tasks", {
            params: { page: nextPage, per_page: 100 },
          });
          allTasks.push(...(pageResponse.data.data || []));
        }

        setTasks(allTasks);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load tasks."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [activeStatus]);

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    if (activeStatus && activeStatus !== "all") {
      filtered = filtered.filter(
        (task) => task.status === activeStatus
      );
    }

    if (searchTerm.trim()) {
      const keyword = searchTerm.toLowerCase().trim();

      filtered = filtered.filter((task) => {
        const title = task.title?.toLowerCase() || "";
        const description =
          task.description?.toLowerCase() || "";
        const status = task.status?.toLowerCase() || "";

        return (
          title.includes(keyword) ||
          description.includes(keyword) ||
          status.includes(keyword)
        );
      });
    }

    return filtered;
  }, [tasks, activeStatus, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / pageSize));
  const visibleTasks = filteredTasks.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [activeStatus, searchTerm]);

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

  const handleSearch = () => {
    setPage(1);
    setSearchTerm(searchInput);
  };

  const handleClearSearch = () => {
    setPage(1);
    setSearchInput("");
    setSearchTerm("");
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelectStatus = (status) => {
    setPage(1);
    setActiveStatus(status);
    setSearchInput("");
    setSearchTerm("");
    setError("");
  };

  const handleBack = () => {
    setPage(1);
    setActiveStatus(null);
    setTasks([]);
    setSearchInput("");
    setSearchTerm("");
    setError("");
  };

  const getCurrentCategory = () => {
    return statusOptions.find(
      (option) => option.key === activeStatus
    );
  };

  return (
    <main className="tasks-main">
      <div className="tasks-container">

        {!activeStatus && (
          <>
            <div className="tasks-heading">
              <h1>Tasks</h1>
              <p>
                Choose a task category to view your assignments.
              </p>
            </div>

            <div className="tasks-options">
              {statusOptions.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  className="tasks-option"
                  onClick={() =>
                    handleSelectStatus(option.key)
                  }
                >
                  <div className="tasks-option-icon">
                    {option.icon}
                  </div>

                  <div className="tasks-option-content">
                    <h2>{option.title}</h2>
                    <p>{option.description}</p>
                  </div>

                  <span className="tasks-option-arrow">
                    →
                  </span>
                </button>
              ))}
            </div>

            {user?.role === "admin" && (
              <div className="tasks-create-section">
                <Link
                  to="/tasks/create"
                  className="primary-button"
                >
                  ＋ Create New Task
                </Link>
              </div>
            )}
          </>
        )}

        {activeStatus && (
          <>
            <button
              type="button"
              className="tasks-back-button"
              onClick={handleBack}
            >
              ← Back to Tasks
            </button>

            <div className="tasks-heading">
              <h1>
                {getCurrentCategory()?.title}
              </h1>

              <p>
                {getCurrentCategory()?.description}
              </p>
            </div>

            <div className="tasks-search">
              <span className="tasks-search-icon">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search tasks..."
                value={searchInput}
                onChange={(e) =>
                  setSearchInput(e.target.value)
                }
                onKeyDown={handleSearchKeyDown}
              />

              <button
                type="button"
                className="tasks-search-button"
                onClick={handleSearch}
              >
                Search
              </button>

              {searchInput && (
                <button
                  type="button"
                  className="tasks-search-clear"
                  onClick={handleClearSearch}
                >
                  Clear
                </button>
              )}
            </div>

            {searchTerm && (
              <div className="tasks-search-result">
                Showing results for:
                <strong> "{searchTerm}"</strong>
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {loading ? (
              <div className="loading">
                Loading tasks...
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state">
                <h3>
                  {searchTerm
                    ? "No matching tasks"
                    : "No tasks found"}
                </h3>

                <p>
                  {searchTerm
                    ? "Try a different search term."
                    : "There are no tasks in this category yet."}
                </p>
              </div>
            ) : (
              <div className="task-list">
                {visibleTasks.map((task) => (
                  <div
                    key={task.id}
                    className="task-card"
                  >
                    <div className="task-card-content">
                      <div>
                        <h2>{task.title}</h2>

                        <p>
                          {task.description ||
                            "No description provided."}
                        </p>

                        <p>
                          <strong>Deadline:</strong>{" "}
                          {new Date(
                            task.deadline
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      <span
                        className={
                          "status " +
                          getStatusClass(task.status)
                        }
                      >
                        {task.status}
                      </span>
                    </div>

                    <div className="task-actions">
                      <Link
                        to={"/tasks/" + task.id}
                        className="primary-button"
                      >
                        View Task
                      </Link>

                      {user?.role === "admin" && (
                        <Link
                          to={"/tasks/" + task.id + "/edit"}
                          className="secondary-button"
                        >
                          Edit
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredTasks.length > pageSize && (
              <div className="pagination">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}