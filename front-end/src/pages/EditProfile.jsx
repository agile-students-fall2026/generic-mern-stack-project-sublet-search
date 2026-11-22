import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./EditProfile.css";

export default function EditProfile() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?.id || "user1";

  const [form, setForm] = useState({
    name: "",
    bio: "",
    school: "",
    city: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/users/me", { headers: { "x-user-id": userId } })
      .then((res) => res.json())
      .then((data) => {
        setForm({
          name: data.name || "",
          bio: data.bio || "",
          school: data.school || "",
          city: data.city || "",
        });
      })
      .catch((err) => console.error("Failed to load profile:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const updated = await res.json();
        const current = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem(
          "user",
          JSON.stringify({ ...current, name: updated.name, photo: updated.photo })
        );
        navigate("/app/profile");
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="edit-profile-page">Loading...</div>;

  return (
    <div className="edit-profile-page">
      <h2>Edit Profile Details</h2>
      <form className="edit-profile-card" onSubmit={handleSubmit}>
        <label className="edit-profile-label">
          Full Name
          <input
            className="edit-profile-input"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label className="edit-profile-label">
          Bio
          <textarea
            className="edit-profile-textarea"
            name="bio"
            rows="3"
            value={form.bio}
            onChange={handleChange}
          />
        </label>

        <label className="edit-profile-label">
          School / University
          <input
            className="edit-profile-input"
            type="text"
            name="school"
            value={form.school}
            onChange={handleChange}
          />
        </label>

        <label className="edit-profile-label">
          City
          <input
            className="edit-profile-input"
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
          />
        </label>

        <div className="edit-profile-actions">
          <button
            type="submit"
            className="edit-profile-primary-btn"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            className="edit-profile-cancel-btn"
            onClick={() => navigate("/app/profile")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}