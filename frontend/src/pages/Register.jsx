import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }

    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((current) => !current);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Name is required.";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      newErrors.email =
        "Please enter a valid email address.";
    }

    if (!form.password) {
      newErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      newErrors.password =
        "Password must be at least 8 characters.";
    }

    if (!form.password_confirmation) {
      newErrors.password_confirmation =
        "Please confirm your password.";
    } else if (
      form.password !== form.password_confirmation
    ) {
      newErrors.password_confirmation =
        "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      await register(
        form.name,
        form.email,
        form.password,
        form.password_confirmation
      );

      navigate("/dashboard");
    } catch (error) {
      const serverErrors =
        error.response?.data?.errors;

      if (serverErrors) {
        const formattedErrors = {};

        Object.keys(serverErrors).forEach((key) => {
          formattedErrors[key] = serverErrors[key][0];
        });

        setErrors(formattedErrors);

        const firstError =
          Object.values(formattedErrors)[0];

        if (firstError) {
          setError(firstError);
        }
      } else {
        setError(
          error.response?.data?.message ||
            "Registration failed. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page register-page">
      <button
        type="button"
        className="login-theme-toggle"
        onClick={toggleDarkMode}
        aria-label={
          darkMode
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
        title={
          darkMode
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      <div className="login-background-shape shape-one"></div>
      <div className="login-background-shape shape-two"></div>
      <div className="login-background-shape shape-three"></div>

      <div className="login-container">
        <div className="login-brand-section">
          <div className="login-brand">
            <div className="login-brand-icon">
              TC
            </div>

            <div>
              <h1>Task</h1>
              <h2>Compliance</h2>
            </div>
          </div>

          <p className="login-system-name">
            Task Assignment & Requirements
            <br />
            Compliance System
          </p>

          <div className="login-features">
            <div className="login-feature">
              <div className="login-feature-icon">
                ✓
              </div>

              <div>
                <strong>Manage assigned tasks</strong>
                <span>
                  Keep track of your tasks and deadlines.
                </span>
              </div>
            </div>

            <div className="login-feature">
              <div className="login-feature-icon">
                ▣
              </div>

              <div>
                <strong>Track requirements</strong>
                <span>
                  Submit and monitor your requirements.
                </span>
              </div>
            </div>

            <div className="login-feature">
              <div className="login-feature-icon">
                ♢
              </div>

              <div>
                <strong>Verify submissions</strong>
                <span>
                  Ensure compliance and completion.
                </span>
              </div>
            </div>
          </div>

          <div className="login-tagline">
            <span>Stay organized.</span>
            <span>Stay compliant.</span>
          </div>

          <div className="login-illustration">
            <div className="illustration-folder folder-one"></div>
            <div className="illustration-folder folder-two"></div>

            <div className="illustration-clipboard">
              <div className="clipboard-clip"></div>

              <div className="clipboard-line"></div>
              <div className="clipboard-line"></div>
              <div className="clipboard-line short"></div>

              <div className="clipboard-check">
                ✓
              </div>

              <div className="clipboard-check second">
                ✓
              </div>

              <div className="clipboard-check third">
                ✓
              </div>
            </div>

            <div className="illustration-card card-one">
              <span>✓</span>
              <div></div>
              <div></div>
            </div>

            <div className="illustration-card card-two">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </div>
        </div>

        <div className="login-form-section">
          <div className="login-card register-card">
            <div className="login-card-header">
              <h2>Create Your Account</h2>

              <p>
                Register to start managing your tasks
                and requirements.
              </p>
            </div>

            {error && (
              <div className="login-error">
                <span>⚠</span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label htmlFor="name">
                  Full Name
                </label>

                <div className="login-input-wrapper">
                  <span className="login-input-icon">
                    ♙
                  </span>

                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="name"
                  />
                </div>

                {errors.name && (
                  <span className="login-field-error">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="login-field">
                <label htmlFor="email">
                  Email Address
                </label>

                <div className="login-input-wrapper">
                  <span className="login-input-icon">
                    ✉
                  </span>

                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>

                {errors.email && (
                  <span className="login-field-error">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="login-field">
                <label htmlFor="password">
                  Password
                </label>

                <div className="login-input-wrapper">
                  <span className="login-input-icon">
                    🔒
                  </span>

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? "◉" : "◌"}
                  </button>
                </div>

                {errors.password && (
                  <span className="login-field-error">
                    {errors.password}
                  </span>
                )}
              </div>

              <div className="login-field">
                <label htmlFor="password_confirmation">
                  Confirm Password
                </label>

                <div className="login-input-wrapper">
                  <span className="login-input-icon">
                    🔒
                  </span>

                  <input
                    id="password_confirmation"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="password_confirmation"
                    placeholder="Confirm your password"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword
                      ? "◉"
                      : "◌"}
                  </button>
                </div>

                {errors.password_confirmation && (
                  <span className="login-field-error">
                    {errors.password_confirmation}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading
                  ? "Creating Account..."
                  : "Create Account"}

                <span>→</span>
              </button>
            </form>

            <div className="login-register">
              <span>Already have an account?</span>

              <Link to="/login">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}