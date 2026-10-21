import { useEffect, useState } from "react";
import api from "../services/api";

const emptyForm = {
  name: "",
  email: "",
  role: "user",
  password: "",
  password_confirmation: "",
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [role, setRole] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/users", {
        params: {
          search: appliedSearch || undefined,
          role: role || undefined,
          page,
        },
      });
      setUsers(response.data.data || []);
      setPagination(response.data || {});
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, role, appliedSearch]);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const startCreate = () => {
    setEditingUser(null);
    setCreating(true);
    setForm(emptyForm);
    setError("");
    setSuccess("");
  };

  const startEdit = (user) => {
    setCreating(false);
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
      password_confirmation: "",
    });
    setError("");
    setSuccess("");
  };

  const cancelForm = () => {
    setCreating(false);
    setEditingUser(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      if (creating) {
        await api.post("/users", form);
        setSuccess("User created successfully. The account can now receive tasks.");
      } else if (editingUser) {
        const data = {
          name: form.name,
          email: form.email,
          role: form.role,
        };
        if (form.password.trim()) {
          data.password = form.password;
        }
        await api.put(`/users/${editingUser.id}`, data);
        setSuccess("User updated successfully.");
      }

      setCreating(false);
      setEditingUser(null);
      setForm(emptyForm);
      setPage(1);
      // fetchUsers uses the current applied filters and current state.
      await fetchUsers();
    } catch (requestError) {
      const errors = requestError.response?.data?.errors;
      setError(
        errors
          ? Object.values(errors)[0]?.[0] || "Please check the form."
          : requestError.response?.data?.message || "Unable to save user."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    setError("");
    setSuccess("");
    try {
      await api.delete(`/users/${userId}`);
      setSuccess("User deleted successfully.");
      await fetchUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete user.");
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  };

  const showingForm = creating || Boolean(editingUser);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>User Management</h1>
          <p>Create accounts, manage roles, and update user information.</p>
        </div>
        {!showingForm && (
          <button type="button" className="primary-button" onClick={startCreate}>
            + Add User
          </button>
        )}
      </div>

      {error && <div className="error-message" role="alert">{error}</div>}
      {success && <div className="success-message" role="status">{success}</div>}

      {showingForm ? (
        <div className="form-card user-form-card">
          <h2>{creating ? "Create User Account" : "Edit User"}</h2>
          <form onSubmit={handleSubmit} className="task-form">
            <label htmlFor="user-name">Name</label>
            <input id="user-name" type="text" name="name" value={form.name} onChange={handleChange} maxLength="255" required />

            <label htmlFor="user-email">Email</label>
            <input id="user-email" type="email" name="email" value={form.email} onChange={handleChange} required />

            <label htmlFor="user-role">Role</label>
            <select id="user-role" name="role" value={form.role} onChange={handleChange} required>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>

            <label htmlFor="user-password">{creating ? "Temporary Password" : "New Password (optional)"}</label>
            <input id="user-password" type="password" name="password" value={form.password} onChange={handleChange} minLength="8" autoComplete="new-password" required={creating} placeholder={creating ? "At least 8 characters" : "Leave blank to keep current password"} />

            {creating && (
              <>
                <label htmlFor="user-password-confirmation">Confirm Password</label>
                <input id="user-password-confirmation" type="password" name="password_confirmation" value={form.password_confirmation} onChange={handleChange} minLength="8" autoComplete="new-password" required />
              </>
            )}

            <div className="form-actions">
              <button type="button" className="secondary-button" onClick={cancelForm}>Cancel</button>
              <button type="submit" className="primary-button" disabled={saving}>
                {saving ? "Saving..." : creating ? "Create User" : "Update User"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <form className="filter-bar" onSubmit={handleSearch}>
            <input type="text" placeholder="Search name or email..." value={search} onChange={(event) => setSearch(event.target.value)} />
            <select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <button type="submit" className="primary-button">Search</button>
          </form>

          {loading ? (
            <div className="loading">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="empty-state">No users found.</div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td><span className={`role-badge role-${user.role}`}>{user.role}</span></td>
                      <td>
                        <div className="table-actions">
                          <button type="button" className="secondary-button" onClick={() => startEdit(user)}>Edit</button>
                          <button type="button" className="danger-button" onClick={() => handleDelete(user.id)}>Delete</button>
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
              <button type="button" disabled={!pagination.prev_page_url} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</button>
              <span>Page {pagination.current_page} of {pagination.last_page}</span>
              <button type="button" disabled={!pagination.next_page_url} onClick={() => setPage((current) => current + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
