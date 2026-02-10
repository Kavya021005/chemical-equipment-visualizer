import { useState } from "react";
import API from "./api";

function UploadCSV() {
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      await API.post("/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("CSV uploaded successfully");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Upload CSV Dataset</h2>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button type="submit">Upload Dataset</button>
    </form>
  );
}

export default UploadCSV;
