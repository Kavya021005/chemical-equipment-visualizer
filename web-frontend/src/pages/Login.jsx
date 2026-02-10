import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // fake login (for task purpose)
    navigate("/");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Chemical Equipment Visualizer</h1>
        <p>Please login to continue</p>

        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}

export default Login;
