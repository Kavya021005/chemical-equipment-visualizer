import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="top-bar-wrapper">
      <div className="top-bar">
        <span className="top-bar-title">
          Chemical Equipment Visualizer
        </span>

        <Link to="/uploaded-datasets" className="nav-btn">
          Uploaded Datasets
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
