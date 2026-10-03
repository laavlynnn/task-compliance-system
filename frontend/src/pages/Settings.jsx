import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Settings() {
  const { user } = useAuth();

  const [section, setSection] = useState(null);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
  }, [user]);

  const clearMessage = () => {
    setMessage("");
    setMessageType("");
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
  };

  const handleUpdateName = async (event) => {
    event.preventDefault();
    clearMessage();

    if (!name.trim()) {
      showMessage("Please enter your full name.", "error");
      return;
    }

    try {
      setLoading(true);

      const response = await api.put("/profile", {
        name: name.trim(),
        email: user.email,
      });

      const updatedUser = response.data.user;

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      showMessage(
        "Full name updated successfully.",
        "success"
      );
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Unable to update your name.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (event) => {
    event.preventDefault();
    clearMessage();

    if (!email.trim()) {
      showMessage(
        "Please enter your email address.",
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.put("/profile", {
        name: user.name,
        email: email.trim(),
      });

      const updatedUser = response.data.user;

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      showMessage(
        "Email address updated successfully.",
        "success"
      );
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Unable to update your email address.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    clearMessage();

    if (!currentPassword) {
      showMessage(
        "Please enter your current password.",
        "error"
      );
      return;
    }

    if (newPassword.length < 8) {
      showMessage(
        "New password must be at least 8 characters.",
        "error"
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage(
        "New password and confirmation do not match.",
        "error"
      );
      return;
    }

    try {
      setLoading(true);

      await api.put("/profile/password", {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      showMessage(
        "Password changed successfully.",
        "success"
      );
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Unable to change your password.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  if (section === "profile") {
    return (
      <main className="settings-main">
        <div className="settings-container">
          <button
            type="button"
            className="settings-back-button"
            onClick={() => {
              setSection(null);
              clearMessage();
            }}
          >
            ← Back to Settings
          </button>

          <div className="settings-heading">
            <h1>Profile</h1>
            <p>
              Update your personal information.
            </p>
          </div>

          <div className="settings-options">
            <button
              type="button"
              className="settings-option"
              onClick={() => {
                clearMessage();
                setSection("name");
              }}
            >
              <div className="settings-option-icon">
                👤
              </div>

              <div className="settings-option-content">
                <h2>Change Full Name</h2>
                <p>Update your name.</p>
              </div>

              <span className="settings-option-arrow">
                →
              </span>
            </button>

            <button
              type="button"
              className="settings-option"
              onClick={() => {
                clearMessage();
                setSection("email");
              }}
            >
              <div className="settings-option-icon">
                ✉️
              </div>

              <div className="settings-option-content">
                <h2>Change Email Address</h2>
                <p>
                  Update your email address.
                </p>
              </div>

              <span className="settings-option-arrow">
                →
              </span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (section === "name") {
    return (
      <main className="settings-main">
        <div className="settings-container">
          <button
            type="button"
            className="settings-back-button"
            onClick={() => {
              setSection("profile");
              clearMessage();
            }}
          >
            ← Back to Profile
          </button>

          <div className="settings-heading">
            <h1>Change Full Name</h1>
            <p>
              Update your name on your account.
            </p>
          </div>

          <div className="settings-card settings-form-card">
            {message && (
              <div
                className={
                  "settings-message " + messageType
                }
              >
                {message}
              </div>
            )}

            <form onSubmit={handleUpdateName}>
              <div className="settings-field">
                <label htmlFor="name">
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your full name"
                />
              </div>

              <button
                type="submit"
                className="settings-button"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  if (section === "email") {
    return (
      <main className="settings-main">
        <div className="settings-container">
          <button
            type="button"
            className="settings-back-button"
            onClick={() => {
              setSection("profile");
              clearMessage();
            }}
          >
            ← Back to Profile
          </button>

          <div className="settings-heading">
            <h1>Change Email Address</h1>
            <p>
              Update the email address connected to your account.
            </p>
          </div>

          <div className="settings-card settings-form-card">
            {message && (
              <div
                className={
                  "settings-message " + messageType
                }
              >
                {message}
              </div>
            )}

            <form onSubmit={handleUpdateEmail}>
              <div className="settings-field">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="Enter your email address"
                />
              </div>

              <button
                type="submit"
                className="settings-button"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  if (section === "password") {
    return (
      <main className="settings-main">
        <div className="settings-container">
          <button
            type="button"
            className="settings-back-button"
            onClick={() => {
              setSection(null);
              clearMessage();
            }}
          >
            ← Back to Settings
          </button>

          <div className="settings-heading">
            <h1>Password & Security</h1>
            <p>Change your account password.</p>
          </div>

          <div className="settings-card settings-form-card">
            {message && (
              <div
                className={
                  "settings-message " + messageType
                }
              >
                {message}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="settings-field">
                <label htmlFor="currentPassword">
                  Current Password
                </label>

                <div className="settings-password">
                  <input
                    id="currentPassword"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter your current password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        !showCurrentPassword
                      )
                    }
                  >
                    {showCurrentPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </div>

              <div className="settings-field">
                <label htmlFor="newPassword">
                  New Password
                </label>

                <div className="settings-password">
                  <input
                    id="newPassword"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter your new password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        !showNewPassword
                      )
                    }
                  >
                    {showNewPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>

                <small
                  style={{
                    display: "block",
                    marginTop: "6px",
                    color: "#94a3b8",
                    fontSize: "12px",
                  }}
                >
                  Password must be at least 8 characters.
                </small>
              </div>

              <div className="settings-field">
                <label htmlFor="confirmPassword">
                  Confirm New Password
                </label>

                <div className="settings-password">
                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Confirm your new password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword
                      )
                    }
                  >
                    {showConfirmPassword
                      ? "Hide"
                      : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="settings-button"
                disabled={loading}
              >
                {loading
                  ? "Changing Password..."
                  : "Change Password"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="settings-main">
      <div className="settings-container">
        <div className="settings-heading">
          <h1>Settings</h1>
          <p>Manage your account settings.</p>
        </div>

        <div className="settings-profile">
          <div className="settings-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          <div className="settings-profile-info">
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>

            <span>
              {user?.role === "admin"
                ? "Administrator"
                : "User"}
            </span>
          </div>
        </div>

        <div className="settings-options">
          <button
            type="button"
            className="settings-option"
            onClick={() => {
              clearMessage();
              setSection("profile");
            }}
          >
            <div className="settings-option-icon">
              👤
            </div>

            <div className="settings-option-content">
              <h2>Profile</h2>
              <p>
                Update your personal information.
              </p>
            </div>

            <span className="settings-option-arrow">
              →
            </span>
          </button>

          <button
            type="button"
            className="settings-option"
            onClick={() => {
              clearMessage();
              setSection("password");
            }}
          >
            <div className="settings-option-icon">
              🔒
            </div>

            <div className="settings-option-content">
              <h2>Password & Security</h2>
              <p>
                Change your account password.
              </p>
            </div>

            <span className="settings-option-arrow">
              →
            </span>
          </button>

          <button
            type="button"
            className="settings-option settings-theme-option"
            onClick={() => setDarkMode(!darkMode)}
          >
            <div className="settings-option-icon">
              {darkMode ? "☀" : "☾"}
            </div>

            <div className="settings-option-content">
              <h2>Dark Mode</h2>

              <p>
                {darkMode
                  ? "Switch to light mode."
                  : "Switch to dark mode."}
              </p>
            </div>

            <div className="settings-toggle">
              <div
                className={
                  darkMode
                    ? "settings-toggle-switch active"
                    : "settings-toggle-switch"
                }
              >
                <div className="settings-toggle-circle"></div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}