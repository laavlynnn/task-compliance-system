import { useEffect, useState } from "react";
import api from "../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/users", {
        params: {
          search: search || undefined,
          role: role || undefined,
          page,
        },
      });

      setUsers(response.data.data);
      setPagination(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, role]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleEdit = (user) => {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
    });

    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setEditingUser(null);

    setForm({
      name: "",
      email: "",
      role: "user",
      password: "",
    });

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const data = {
        name: form.name,
        email: form.email,
        role: form.role,
      };

      if (form.password.trim()) {
        data.password = form.password;
      }

      await api.put(
        `/users/${editingUser.id}`,
        data
      );

      setSuccess("User updated successfully.");

      setEditingUser(null);

      setForm({
        name: "",
        email: "",
        role: "user",
        password: "",
      });

      await fetchUsers();
    } catch (error) {
      const errors = error.response?.data?.errors;

      if (errors) {
        const firstError =
          Object.values(errors)[0]?.[0];

        setError(
          firstError || "Please check the form."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Unable to update user."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.delete(`/users/${userId}`);

      setSuccess("User deleted successfully.");

      await fetchUsers();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete user."
      );
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p>
            Manage system users and their roles.
          </p>
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

      {editingUser && (
        <div className="form-card user-form-card">
          <h2>Edit User</h2>

          <form
            onSubmit={handleSubmit}
            className="task-form"
          >
            <label>Name</label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <label>Email</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <label>Role</label>

            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              required
            >
              <option value="user">
                User
              </option>

              <option value="admin">
                Admin
              </option>
            </select>

            <label>
              New Password
            </label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
              minLength="8"
            />

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleCancel}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Update User"}
              </button>
            </div>
          </form>
        </div>
      )}

      <form
        className="filter-bar"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          placeholder="Search name or email..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={role}
          onChange={(event) => {
            setRole(event.target.value);
            setPage(1);
          }}
        >
          <option value="">
            All Roles
          </option>

          <option value="admin">
            Admin
          </option>

          <option value="user">
            User
          </option>
        </select>

        <button
          type="submit"
          className="primary-button"
        >
          Search
        </button>
      </form>

      {loading ? (
        <div className="loading">
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          No users found.
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>

                  <td>{user.email}</td>

                  <td>
                    <span
                      className={`role-badge role-${user.role}`}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        className="secondary-button"
                        onClick={() =>
                          handleEdit(user)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="danger-button"
                        onClick={() =>
                          handleDelete(user.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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