import { useEffect, useState } from "react";
import api from "../services/api";

export default function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [viewingFile, setViewingFile] = useState(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/submissions", {
        params: {
          search: search || undefined,
          status: status || undefined,
          page,
        },
      });

      setSubmissions(response.data.data || []);
      setPagination(response.data.meta || {});
    } catch (error) {
      console.error("Unable to load submissions:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load submissions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [page, status]);

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    fetchSubmissions();
  };

  const handleViewFile = async (submission) => {
    if (!submission?.id) {
      setError("Unable to identify the submission.");
      return;
    }

    if (!submission?.file_path) {
      setError("No file was submitted.");
      return;
    }

    setError("");
    setSuccess("");
    setViewingFile(submission.id);

    // Open the tab immediately so the browser does not block it
    const newWindow = window.open("", "_blank");

    if (!newWindow) {
      setError(
        "Please allow pop-ups for this website to view the file."
      );
      setViewingFile(null);
      return;
    }

    newWindow.document.write(`
      <html>
        <head>
          <title>Opening File...</title>
        </head>
        <body
          style="
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          "
        >
          <h2>Opening file...</h2>
        </body>
      </html>
    `);

    try {
      const response = await api.get(
        `/submissions/${submission.id}/file`,
        {
          responseType: "blob",
        }
      );

      const contentType =
        response.headers["content-type"] ||
        "application/octet-stream";

      const blob = new Blob([response.data], {
        type: contentType,
      });

      const fileUrl = window.URL.createObjectURL(blob);

      newWindow.location.href = fileUrl;

      setTimeout(() => {
        window.URL.revokeObjectURL(fileUrl);
      }, 60000);
    } catch (error) {
      console.error(
        "Unable to view submission file:",
        error
      );

      // Try to read Laravel's JSON error message
      let message =
        "Unable to open the submitted file.";

      const responseData = error.response?.data;

      if (responseData instanceof Blob) {
        try {
          const text = await responseData.text();
          const json = JSON.parse(text);

          if (json.message) {
            message = json.message;
          }
        } catch {
          // Keep the default message
        }
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      }

      setError(message);

      newWindow.close();
    } finally {
      setViewingFile(null);
    }
  };

  const handleVerify = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to verify this submission?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.put(`/submissions/${id}/verify`);

      setSuccess(
        "Submission verified successfully."
      );

      await fetchSubmissions();
    } catch (error) {
      console.error(
        "Unable to verify submission:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to verify submission."
      );
    }
  };

  const handleReject = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this submission?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await api.put(`/submissions/${id}/reject`);

      setSuccess(
        "Submission rejected successfully."
      );

      await fetchSubmissions();
    } catch (error) {
      console.error(
        "Unable to reject submission:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to reject submission."
      );
    }
  };

  const getStatusClass = (submissionStatus) => {
    if (!submissionStatus) {
      return "status";
    }

    return `status status-${submissionStatus
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Submissions</h1>

          <p>
            Review and verify user requirement
            submissions.
          </p>
        </div>
      </div>

      <form
        className="filter-bar"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          placeholder="Search submissions..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="Submitted">
            Submitted
          </option>
          <option value="Verified">
            Verified
          </option>
          <option value="Rejected">
            Rejected
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

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      {loading ? (
        <div className="loading">
          Loading submissions...
        </div>
      ) : submissions.length === 0 ? (
        <div className="empty-state">
          No submissions found.
        </div>
      ) : (
        <div className="submission-list">
          {submissions.map((submission) => (
            <div
              className="submission-card"
              key={submission.id}
            >
              <div className="submission-card-header">
                <div>
                  <h2>
                    {submission.requirement?.name ||
                      "Requirement"}
                  </h2>

                  <p>
                    <strong>Task:</strong>{" "}
                    {submission.requirement?.task
                      ?.title || "N/A"}
                  </p>

                  <p>
                    <strong>Submitted by:</strong>{" "}
                    {submission.submitter?.name ||
                      "N/A"}
                  </p>

                  <p>
                    <strong>Email:</strong>{" "}
                    {submission.submitter?.email ||
                      "N/A"}
                  </p>
                </div>

                <span
                  className={getStatusClass(
                    submission.status
                  )}
                >
                  {submission.status}
                </span>
              </div>

              {submission.submission_text && (
                <div className="submission-text">
                  <strong>Submission:</strong>

                  <p>
                    {submission.submission_text}
                  </p>
                </div>
              )}

              {submission.file_path && (
                <div className="submission-file">
                  <strong>Attached File:</strong>

                  <div className="file-actions">
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() =>
                        handleViewFile(submission)
                      }
                      disabled={
                        viewingFile ===
                        submission.id
                      }
                    >
                      {viewingFile === submission.id
                        ? "Opening File..."
                        : "View File"}
                    </button>

                    <span>
                      {submission.file_path}
                    </span>
                  </div>
                </div>
              )}

              <div className="task-actions">
                {submission.status !==
                  "Verified" && (
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() =>
                      handleVerify(
                        submission.id
                      )
                    }
                  >
                    Verify
                  </button>
                )}

                {submission.status !==
                  "Rejected" && (
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() =>
                      handleReject(
                        submission.id
                      )
                    }
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.last_page > 1 && (
        <div className="pagination">
          <button
            type="button"
            disabled={
              !pagination.prev_page_url
            }
            onClick={() =>
              setPage((currentPage) =>
                Math.max(currentPage - 1, 1)
              )
            }
          >
            Previous
          </button>

          <span>
            Page {pagination.current_page} of{" "}
            {pagination.last_page}
          </span>

          <button
            type="button"
            disabled={
              !pagination.next_page_url
            }
            onClick={() =>
              setPage((currentPage) =>
                currentPage + 1
              )
            }
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}