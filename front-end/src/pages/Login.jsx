import { useState } from "react";
import Header from "../components/Header";
import TextField from "../components/TextField";
import {useNavigate} from "react-router-dom";
import "./Login.css"

export default function Login(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState(""); 
  const [isForgot, setIsForgot] = useState(false); 

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setMessage("");

  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    setError(data.error || "Login failed.");
    return;
  }

  localStorage.setItem("user", JSON.stringify(data));
    if (props.onLogin) {
      props.onLogin(data);
    }
    navigate("/app/explore");
  }

  async function handleReset(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword: password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Reset failed.");
      return;
    }

    setMessage(data.message);
    setPassword("");
    setIsForgot(false);
  }
  
  return (
    <div>
      <Header />
      <div className="page">
        <div className="card">
        <h2>{isForgot ? "Reset Password" : "Login"}</h2>

        {error && <p className="error-msg">{error}</p>}
        {message && <p className="success-msg" >{message}</p>}
       
          <form onSubmit={isForgot ? handleReset : handleLogin}>
            <TextField 
              label="Email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <TextField 
              label={isForgot ? "New Password" : "Password"} 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />

          {!isForgot && (
              <div className="forgot-row">
                <button
                  type="button"
                  className="link"
                  onClick={() => {
                    setIsForgot(true);
                    setError("");
                    setMessage("");
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" className="btn primary">
              {isForgot ? "Reset Password" : "Login"}
            </button>

            </form>

          {!isForgot ? (
              <p className="switch-text">
                <button
                  type="button"
                  className="link"
                  onClick={() => {
                    setIsForgot(false);
                    setError("");
                  }}
                >
                  Back to Login
                </button>
              </p>
          ) : (
            <p className="switch-text">
            Don't have an account?{" "}
            <button className="link" onClick={() => navigate("/signUp")}>
              Sign Up
            </button>
            </p>
            )}

          <div className="guest-wrapper">
            <button className="btn secondary" onClick={() => navigate("/app/explore")}>
              Continue as a Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
