import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function TaskDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    is_required: true,
  });

  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadTask = async () => {
    try {
      const response = await api.get(`/tasks/${id}`);

      setTask(response.data.task);
      setRequirements(response.data.task.requirements || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load task."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (editingId) {
        await api.put(`/requirements/${editingId}`, form);
        setSuccess("Requirement updated successfully.");
      } else {
        await api.post(`/tasks/${id}/requirements`, form);
        setSuccess("Requirement added successfully.");
      }

      setForm({
        name: "",
        description: "",
        is_required: true,
      });

      setEditingId(null);

      await loadTask();
    } catch (error) {
      const errors = error.response?.data?.errors;

      if (errors) {
        const firstError = Object.values(errors)[0]?.[0];
        setError(firstError || "Please check the form.");
      } else {
        setError(
          error.response?.data?.message ||
            "Unable to save requirement."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (requirement) => {
    setEditingId(requirement.id);

    setForm({
      name: requirement.name,
      description: requirement.description || "",
      is_required: requirement.is_required,
    });

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);

    setForm({
      name: "",
      description: "",
      is_required: true,
    });

    setError("");
  };

  const handleDelete = async (requirementId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this requirement?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/requirements/${requirementId}`);

      setSuccess("Requirement deleted successfully.");

      await loadTask();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete requirement."
      );
    }
  };

  if (loading) {
    return <div className="loading">Loading task...</div>;
  }

  if (error && !task) {
    return (
      <div className="page">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="page">
        <div className="empty-state">
          Task not found.
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/tasks" className="back-link">
        ← Back to Tasks
      </Link>

      <div className="detail-card">
        <div className="detail-header">
          <div>
            <h1>{task.title}</h1>
            <p>{task.description}</p>
          </div>

          <span
            className={`status status-${task.status
              .toLowerCase()
              .replace(" ", "-")}`}
          >
            {task.status}
          </span>
        </div>

        <div className="detail-info">
          <div>
            <strong>Deadline</strong>
            <span>
              {new Date(task.deadline).toLocaleDateString()}
            </span>
          </div>

          <div>
            <strong>Assigned To</strong>
            <span>
              {task.assigned_user?.name || "N/A"}
            </span>
          </div>

          <div>
            <strong>Created By</strong>
            <span>
              {task.creator?.name || "N/A"}
            </span>
          </div>
        </div>

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

        <h2>Requirements</h2>

        {requirements.length === 0 ? (
          <div className="empty-state">
            No requirements have been added.
          </div>
        ) : (
          <div className="requirements-list">
            {requirements.map((requirement) => (
              <div
                className="requirement-card"
                key={requirement.id}
              >
                <div>
                  <h3>{requirement.name}</h3>

                  <p>
                    {requirement.description ||
                      "No description provided."}
                  </p>

                  <span>
                    {requirement.is_required
                      ? "Required"
                      : "Optional"}
                  </span>
                </div>

                <div className="task-actions">
                  {user?.role === "user" && (
                    <Link
                      to={`/requirements/${requirement.id}/submit`}
                      className="primary-button"
                    >
                      Submit
                    </Link>
                  )}

                  {user?.role === "admin" && (
                    <>
                      <button
                        className="secondary-button"
                        onClick={() =>
                          handleEdit(requirement)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="danger-button"
                        onClick={() =>
                          handleDelete(requirement.id)
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

        {user?.role === "admin" && (
          <div className="requirement-form">
            <h2>
              {editingId
                ? "Edit Requirement"
                : "Add Requirement"}
            </h2>

            <form onSubmit={handleSubmit}>
              <label>Requirement Name</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Example: Student Report File"
                required
              />

              <label>Description</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe what the user needs to submit."
                rows="4"
              />

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_required"
                  checked={form.is_required}
                  onChange={handleChange}
                />

                Required requirement
              </label>

              <div className="form-actions">
                {editingId && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Requirement"
                    : "Add Requirement"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}