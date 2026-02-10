import axios from "axios";

const API = axios.create({
  baseURL: "https://chemical-equipment-visualizer-mdxc.onrender.com/api/",
});

export default API;
