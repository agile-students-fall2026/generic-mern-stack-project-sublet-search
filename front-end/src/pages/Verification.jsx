import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Verification.css";

export default function Verification() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id || "user1";

  const [verifications, setVerifications] = useState({
    eduEmail: false,
    govId: false,
    phone: false,
  });
  const [eduInput, setEduInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/users/me", { headers: { "x-user-id": userId } })
      .then((res) => res.json())
      .then((data) => {
        if (data.verifications) setVerifications(data.verifications);
        if (data.email) setEduInput(data.email);
      })
      .catch((err) => console.error("Failed to fetch verifications:", err));
  }, [userId]);

  async function updateVerification(field, value = true) {
    try {
      const res = await fetch("/api/users/me/verifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (res.ok) {
        const updated = await res.json();
        setVerifications(updated.verifications);
        setMessage("Verification updated!");
      }
    } catch (err) {
      console.error("Verification update failed:", err);
    }
  }

  function handleEduVerify(e) {
    e.preventDefault();
    if (!eduInput.endsWith(".edu")) {
      setMessage("Please enter a valid .edu email address.");
      return;
    }
    updateVerification("eduEmail", true);
  }

  return (
    <div className="verification-page">
      <h2>ID & Student Verification</h2>
      {message && <p className="verification-status-msg">{message}</p>}

      <div className="verification-card">
        <div className="verification-header">
          <h3>Student Email (.edu)</h3>
          <span
            className={`verification-pill ${
              verifications.eduEmail ? "verified" : "unverified"
            }`}
          >
            {verifications.eduEmail ? "Verified" : "Unverified"}
          </span>
        </div>

        {verifications.eduEmail ? (
          <p className="verification-detail">Verified with {eduInput}</p>
        ) : (
          <form className="verification-inline-form" onSubmit={handleEduVerify}>
            <input
              className="verification-input"
              type="email"
              placeholder="you@university.edu"
              value={eduInput}
              onChange={(e) => setEduInput(e.target.value)}
              required
            />
            <button type="submit" className="verification-primary-btn">
              Verify .edu Email
            </button>
          </form>
        )}
      </div>

      <div className="verification-card">
        <div className="verification-header">
          <h3>Government ID</h3>
          <span
            className={`verification-pill ${
              verifications.govId ? "verified" : "unverified"
            }`}
          >
            {verifications.govId ? "Verified" : "Unverified"}
          </span>
        </div>

        {verifications.govId ? (
          <p className="verification-detail">Government-issued ID approved.</p>
        ) : (
          <div className="verification-inline-form">
            <input
              className="verification-file-input"
              type="file"
              accept="image/*,.pdf"
            />
            <button
              type="button"
              className="verification-primary-btn"
              onClick={() => updateVerification("govId", true)}
            >
              Submit ID
            </button>
          </div>
        )}
      </div>

      <div className="verification-card">
        <div className="verification-header">
          <h3>Phone Number</h3>
          <span
            className={`verification-pill ${
              verifications.phone ? "verified" : "unverified"
            }`}
          >
            {verifications.phone ? "Verified" : "Unverified"}
          </span>
        </div>

        {verifications.phone ? (
          <p className="verification-detail">Phone number confirmed.</p>
        ) : (
          <div className="verification-inline-form">
            <input
              className="verification-input"
              type="tel"
              placeholder="(555) 123-4567"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
            />
            <button
              type="button"
              className="verification-primary-btn"
              onClick={() => phoneInput && updateVerification("phone", true)}
            >
              Verify Phone
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        className="verification-back-btn"
        onClick={() => navigate("/app/profile")}
      >
        ← Back to Profile
      </button>
    </div>
  );
}