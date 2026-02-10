import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "./api";

function DatasetList() {
  const [datasets, setDatasets] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/datasets/")
      .then((res) => setDatasets(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ width: "100%", marginTop: "30px" }}>
      <h2 className="section-title">Uploaded Datasets</h2>

      {datasets.length === 0 && (
        <p style={{ textAlign: "center", color: "#94a3b8" }}>
          No datasets uploaded yet
        </p>
      )}

      {datasets.map((ds) => (
        <div key={ds.id} className="card">
          <strong>{ds.filename}</strong>
          <p>Total Equipment: {ds.total_count}</p>

          <button onClick={() => navigate(`/datasets/${ds.id}`)}>
            View Records
          </button>
        </div>
      ))}
    </div>
  );
}

export default DatasetList;
