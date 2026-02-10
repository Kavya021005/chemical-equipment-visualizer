import { BrowserRouter, Routes, Route } from "react-router-dom";
import UploadCSVModern from "./components/UploadCSVModern";
import DatasetDetail from "./pages/ViewRecords";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import UploadedDatasets from "./pages/UploadedDatasets";
import "./App.css";
import ViewRecords from './pages/ViewRecords';


// Image import
import laptopImg from "./assets/dashboard-laptop.jpeg";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN PAGE */}
        <Route path="/login" element={<Login />} />
        <Route path="/datasets/:datasetId/records" element={<ViewRecords />} />
        

        {/* HOME / DASHBOARD */}
        <Route
          path="/"
          element={
            <>
              <Navbar />

              {/* HERO SECTION */}
              <section className="hero">
                <div className="hero-left">
                  <h1>Chemical Equipment Visualizer</h1>
                  <p>
                    Upload, analyze and visualize chemical equipment data
                    to generate insights and reports.
                  </p>

                  {/* Upload ONLY here */}
                  <UploadCSVModern />

                </div>

                <div className="hero-right">
                  <img
                    src={laptopImg}
                    alt="Dashboard Laptop Preview"
                    className="laptop-image"
                  />
                </div>
              </section>
            </>
          }
        />

        {/* UPLOADED DATASETS PAGE */}
        <Route
          path="/uploaded-datasets"
          element={
            <>
              <Navbar />
              <UploadedDatasets />
            </>
          }
        />

        {/* DATASET DETAIL PAGE */}
        <Route path="/datasets/:id" element={<DatasetDetail />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
