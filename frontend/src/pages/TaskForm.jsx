import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function TaskForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    assigned_to: "",
    deadline: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const usersResponse = await api.get("/users", {
          params: {
            role: "user",
          },
        });

        setUsers(usersResponse.data.data);

        if (isEdit) {
          const taskResponse = await api.get(`/tasks/${id}`);
          const task = taskResponse.data.task;

          setForm({
            title: task.title,
            description: task.description,
            assigned_to: task.assigned_to,
            deadline: task.deadline
              ? task.deadline.substring(0, 10)
              : "",
          });
        }
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load task information."
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/tasks/${id}`, form);
        setSuccess("Task updated successfully.");
      } else {
        await api.post("/tasks", form);
        setSuccess("Task created successfully.");
      }

      setTimeout(() => {
        navigate("/tasks");
      }, 800);
    } catch (error) {
      const errors = error.response?.data?.errors;

      if (errors) {
        const firstError = Object.values(errors)[0]?.[0];
        setError(firstError || "Please check the form.");
      } else {
        setError(
          error.response?.data?.message ||
            "Unable to save task."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="page">
      <div className="form-card">
        <h1>
          {isEdit ? "Edit Task" : "Create Task"}
        </h1>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="task-form">
          <label>Task Title</label>

          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter task title"
            required
          />

          <label>Description</label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter task description"
            rows="5"
            required
          />

          <label>Assign To</label>

          <select
            name="assigned_to"
            value={form.assigned_to}
            onChange={handleChange}
            required
          >
            <option value="">
              Select a user
            </option>

            {users.map((user) => (
              <option
                key={user.id}
                value={user.id}
              >
                {user.name} ({user.email})
              </option>
            ))}
          </select>

          <label>Deadline</label>

          <input
            type="date"
            name="deadline"
            value={form.deadline}
            onChange={handleChange}
            required
          />

          <div className="form-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => navigate("/tasks")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Task"
                : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}