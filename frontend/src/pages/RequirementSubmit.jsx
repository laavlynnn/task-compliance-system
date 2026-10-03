import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function RequirementSubmit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [requirement, setRequirement] = useState(null);
  const [submission, setSubmission] = useState(null);

  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadRequirement = async () => {
      try {
        const requirementResponse = await api.get(
          `/requirements/${id}`
        );

        const currentRequirement =
          requirementResponse.data.requirement;

        setRequirement(currentRequirement);

        try {
          const submissionResponse = await api.get(
            `/requirements/${id}/submission`
          );

          const currentSubmission =
            submissionResponse.data.submission;

          setSubmission(currentSubmission);
          setText(currentSubmission.submission_text || "");
        } catch (error) {
          if (error.response?.status !== 404) {
            throw error;
          }
        }
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Unable to load requirement."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRequirement();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!text.trim() && !file) {
      setError("Please provide text or select a file.");
      return;
    }

    setSaving(true);

    try {
      const formData = new FormData();

      if (text.trim()) {
        formData.append("submission_text", text);
      }

      if (file) {
        formData.append("file", file);
      }

      const response = await api.post(
        `/requirements/${id}/submission`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSubmission(response.data.submission);
      setSuccess(
        "Requirement submitted successfully."
      );

      setFile(null);

      event.target.reset();

      setTimeout(() => {
        navigate(
          `/tasks/${response.data.submission.requirement.task_id}`
        );
      }, 1000);
    } catch (error) {
      const errors = error.response?.data?.errors;

      if (errors) {
        const firstError = Object.values(errors)[0]?.[0];
        setError(firstError || "Please check your submission.");
      } else {
        setError(
          error.response?.data?.message ||
            "Unable to submit requirement."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        Loading requirement...
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="page">
        <div className="error-message">
          {error || "Requirement not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Link
        to={`/tasks/${requirement.task_id}`}
        className="back-link"
      >
        ← Back to Task
      </Link>

      <div className="form-card">
        <h1>Submit Requirement</h1>

        <div className="submission-info">
          <h2>{requirement.name}</h2>

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

        {submission && (
          <div className="submission-status">
            <strong>Current Status:</strong>{" "}
            <span
              className={`status status-${submission.status.toLowerCase()}`}
            >
              {submission.status}
            </span>

            {submission.status === "Verified" && (
              <p>
                Your submission has been verified by the
                administrator.
              </p>
            )}

            {submission.status === "Rejected" && (
              <p>
                Your submission was rejected. You may
                submit again.
              </p>
            )}
          </div>
        )}

        {submission?.status !== "Verified" && (
          <form
            onSubmit={handleSubmit}
            className="submission-form"
          >
            <label>Submission Text</label>

            <textarea
              value={text}
              onChange={(event) =>
                setText(event.target.value)
              }
              placeholder="Enter your submission details..."
              rows="6"
            />

            <label>Upload File</label>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(event) =>
                setFile(event.target.files[0] || null)
              }
            />

            <p className="file-help">
              Accepted: PDF, JPG, JPEG, PNG, DOC, DOCX.
              Maximum size: 5MB.
            </p>

            <div className="form-actions">
              <Link
                to={`/tasks/${requirement.task_id}`}
                className="secondary-button"
              >
                Cancel
              </Link>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Submitting..."
                  : submission?.status === "Rejected"
                  ? "Resubmit"
                  : "Submit Requirement"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}