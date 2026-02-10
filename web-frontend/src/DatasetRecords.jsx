import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "./api";

function DatasetRecords() {
  const { id } = useParams();
  const [records, setRecords] = useState([]);

  useEffect(() => {
    API.get(`datasets/${id}/records/`)
      .then((res) => setRecords(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Equipment Records</h2>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Flowrate</th>
            <th>Pressure</th>
            <th>Temperature</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{r.equipment_name}</td>
              <td>{r.type}</td>
              <td>{r.flowrate}</td>
              <td>{r.pressure}</td>
              <td>{r.temperature}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DatasetRecords;
<button
  onClick={() =>
    window.open(
      `http://127.0.0.1:8000/api/datasets/${datasetId}/report/`,
      "_blank"
    )
  }
>
  Download Report (PDF)
</button>
