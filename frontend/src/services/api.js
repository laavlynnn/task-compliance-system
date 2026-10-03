const handleViewFile = async () => {
  try {
    const response = await api.get(
      `/submissions/${submission.id}/file`,
      {
        responseType: "blob",
      }
    );

    const contentType =
      response.headers["content-type"] || "application/octet-stream";

    const blob = new Blob([response.data], {
      type: contentType,
    });

    const fileUrl = window.URL.createObjectURL(blob);

    window.open(fileUrl, "_blank");

    setTimeout(() => {
      window.URL.revokeObjectURL(fileUrl);
    }, 60000);
  } catch (error) {
    console.error("Error viewing file:", error);

    alert(
      error.response?.data?.message ||
      "Unable to open the submitted file."
    );
  }
};