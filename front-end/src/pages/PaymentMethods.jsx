import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentMethods.css";

export default function PaymentMethods() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id || "user1";

  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    type: "Card",
    label: "",
    last4: "",
    expiry: "",
  });

  useEffect(() => {
    fetch("/api/users/me/payment-methods", {
      headers: { "x-user-id": userId },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMethods(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load payment methods:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.label || form.last4.length !== 4) return;

    try {
      const res = await fetch("/api/users/me/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const updated = await res.json();
        setMethods(updated);
        setForm({ type: "Card", label: "", last4: "", expiry: "" });
      }
    } catch (err) {
      console.error("Failed to add payment method:", err);
    }
  }

  async function handleSetDefault(id) {
    try {
      const res = await fetch(`/api/users/me/payment-methods/${id}/default`, {
        method: "PUT",
        headers: { "x-user-id": userId },
      });
      if (res.ok) {
        const updated = await res.json();
        setMethods(updated);
      }
    } catch (err) {
      console.error("Failed to set default payment method:", err);
    }
  }

  async function handleRemove(id) {
    try {
      const res = await fetch(`/api/users/me/payment-methods/${id}`, {
        method: "DELETE",
        headers: { "x-user-id": userId },
      });
      if (res.ok) {
        const updated = await res.json();
        setMethods(updated);
      }
    } catch (err) {
      console.error("Failed to remove payment method:", err);
    }
  }

  if (loading) return <div className="payment-page">Loading payment methods...</div>;

  return (
    <div className="payment-page">
      <h2>Payment & Payout Methods</h2>
      <p className="payment-subtitle">
        Manage cards and bank accounts used for sublet deposits and payouts.
      </p>

      <div className="payment-card">
        <h3>Saved Methods</h3>
        {methods.length === 0 ? (
          <p className="payment-empty">No payment methods saved yet.</p>
        ) : (
          <ul className="payment-list">
            {methods.map((method) => (
              <li key={method.id} className="payment-item">
                <div className="payment-info">
                  <span className="payment-badge">{method.type}</span>
                  <div>
                    <strong>{method.label}</strong> •••• {method.last4}
                    {method.expiry && (
                      <span className="payment-expiry"> (Exp {method.expiry})</span>
                    )}
                  </div>
                  {method.isDefault && (
                    <span className="payment-default-tag">Default</span>
                  )}
                </div>

                <div className="payment-actions">
                  {!method.isDefault && (
                    <button
                      type="button"
                      className="payment-secondary-btn"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    type="button"
                    className="payment-delete-btn"
                    onClick={() => handleRemove(method.id)}
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form className="payment-card payment-form" onSubmit={handleAdd}>
        <h3>Add New Method</h3>

        <label className="payment-label">
          Account Type
          <select
            className="payment-input"
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option value="Card">Credit / Debit Card</option>
            <option value="Bank">Bank Account (ACH)</option>
          </select>
        </label>

        <label className="payment-label">
          Cardholder or Bank Name
          <input
            className="payment-input"
            type="text"
            name="label"
            placeholder="e.g., Visa or Chase Checking"
            value={form.label}
            onChange={handleChange}
            required
          />
        </label>

        <div className="payment-row">
          <label className="payment-label">
            Last 4 Digits
            <input
              className="payment-input"
              type="text"
              name="last4"
              maxLength="4"
              pattern="\d{4}"
              placeholder="4242"
              value={form.last4}
              onChange={handleChange}
              required
            />
          </label>

          {form.type === "Card" && (
            <label className="payment-label">
              Expiry (MM/YY)
              <input
                className="payment-input"
                type="text"
                name="expiry"
                placeholder="08/28"
                value={form.expiry}
                onChange={handleChange}
              />
            </label>
          )}
        </div>

        <button type="submit" className="payment-primary-btn">
          + Add Payment Method
        </button>
      </form>

      <button
        type="button"
        className="payment-back-btn"
        onClick={() => navigate("/app/profile")}
      >
        ← Back to Profile
      </button>
    </div>
  );
}