import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import TextField from "../components/TextField";
import "./Login.css";

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

    try {
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
    } catch {
      setError("Could not connect to the server.");
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Reset request failed.");
        return;
      }

      setMessage(data.message);
      setPassword("");
      setIsForgot(false);
    } catch {
      setError("Could not connect to the server.");
    }
  }

  return (
    <div>
      <Header />

      <div className="page">
        <div className="card">
          <h2>{isForgot ? "Request a password reset" : "Login"}</h2>

          {error && <p className="error-msg">{error}</p>}
          {message && <p className="success-msg">{message}</p>}

          <form onSubmit={isForgot ? handleReset : handleLogin}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {!isForgot && (
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}

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
              {isForgot ? "Request reset" : "Login"}
            </button>
          </form>

          {isForgot ? (
            <p className="switch-text">
              <button
                type="button"
                className="link"
                onClick={() => {
                  setIsForgot(false);
                  setError("");
                  setMessage("");
                }}
              >
                Back to Login
              </button>
            </p>
          ) : (
            <p className="switch-text">
              Don't have an account?{" "}
              <button
                type="button"
                className="link"
                onClick={() => navigate("/signUp")}
              >
                Sign Up
              </button>
            </p>
          )}

          <div className="guest-wrapper">
            <button
              type="button"
              className="btn secondary"
              onClick={() => navigate("/app/explore")}
            >
              Continue as a Guest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
