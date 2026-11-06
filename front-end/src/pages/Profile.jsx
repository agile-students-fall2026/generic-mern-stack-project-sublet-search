import React, { useState } from "react";
import Header from "../components/Header";
import ListingCard from "../components/ListingCard";
import ReviewCard from "../components/ReviewCard";
import mockListings from "../mockListings";
import "./Profile.css";

export default function Profile(props) {
  const [mode, setMode] = useState("subtenant");

  let currentUser = props.user;
  if (!currentUser) {
    currentUser = {
      name: "Alex Chen",
      bio: "NYU student looking for summer housing near Washington Square Park.",
      university: "NYU",
      location: "New York",
    };
  }

  let listings = props.activeListings;
  if (!listings) {
    listings = mockListings;
  }

  let saved = props.savedListings;
  if (!saved) {
    saved = [mockListings[0], mockListings[1]];
  }

  let reviewsList = props.REVIEWS;
  if (!reviewsList) {
    reviewsList = [];
  }

  const myApplications = [
    {
      id: 1,
      title: "Studio in East Village",
      landlord: "Sarah M.",
      status: "Pending",
      date: "May 1 - Aug 31",
    },
    {
      id: 2,
      title: "1BR in Williamsburg",
      landlord: "David K.",
      status: "Approved",
      date: "Jun 1 - Aug 15",
    },
  ];

  function handleSubtenantClick() {
    setMode("subtenant");
  }

  function handleSublessorClick() {
    setMode("sublessor");
  }

  return (
    <div>
      <Header onMenu={function () {}} />

      <div className="page">
        <h2>Profile</h2>

        {/* Profile Info */}
        <div className="card">
          <div className="photo">Profile photo</div>
          <h3>{currentUser.name}</h3>
          <p>{currentUser.bio}</p>
          <p className="muted">
            {currentUser.university} | {currentUser.location}
          </p>

          <div>
            <button
              className={mode === "subtenant" ? "active" : ""}
              onClick={handleSubtenantClick}
            >
              Subtenant Mode
            </button>

            <button
              className={mode === "sublessor" ? "active" : ""}
              onClick={handleSublessorClick}
            >
              Sublessor Mode
            </button>
          </div>
        </div>

        {/* Verifications */}
        <div className="card">
          <h3>Verifications</h3>
          <ul className="verifications-list">
            <li> <strong>NYU Email Verified</strong> (.edu)</li>
            <li> <strong>Government ID Verified</strong></li>
            <li> <strong>Phone Number Verified</strong></li>
          </ul>
        </div>

        {mode === "subtenant" && (
          <div>
            <div className="section">
              <h3>Saved Sublets ({saved.length})</h3>
              {saved.length > 0 ? (
                <div className="listings-grid">
                  {saved.map(function (item) {
                    return <ListingCard key={item.id} listing={item} />;
                  })}
                </div>
              ) : (
                <p className="muted">
                  No saved listings yet.
                </p>
              )}
            </div>

            <div className="card">
              <h3>My Applications</h3>
              {myApplications.length > 0 ? (
                <div className="applications-list">
                  {myApplications.map(function (app) {
                    return (
                      <div key={app.id} className="application-item">
                        <div>
                          <strong className="app-title">{app.title}</strong>
                          <p className="muted app-details">
                            Host: {app.landlord} • {app.date}
                          </p>
                        </div>
                        <span className={`status-badge ${app.status.toLowerCase()}`}>
                          {app.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="muted">No applications.</p>
              )}
            </div>
          </div>
        )}

        {mode === "sublessor" && (
          <div className="section">
            <div className="section-header">
              <h3>My Listings ({listings.length})</h3>
              <button
                className="primary-btn"
                onClick={function () {
                  if (props.navigate) {
                    props.navigate("/post-sublet");
                  }
                }}
              >
                + Post a Sublet
              </button>
            </div>

            {listings.length > 0 ? (
              <div className="listings-grid">
                {listings.map(function (listing) {
                  return (
                    <div key={listing.id} className="listing-wrapper">
                      <ListingCard listing={listing} />
                      <div className="listing-actions">
                        <button
                          className="remove-btn"
                          onClick={function () {
                            if (props.handleRemove) {
                              props.handleRemove(listing.id);
                            }
                          }}
                        >
                          Remove Listing
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card empty-card">
                <p className="muted">You haven't posted any sublet listings yet.</p>
                <button
                  className="primary-btn margin-top-sm"
                  onClick={function () {
                    if (props.navigate) {
                      props.navigate("/post-sublet");
                    }
                  }}
                >
                  Create Your First Listing
                </button>
              </div>
            )}
          </div>
        )}

        {/* Reviews Section */}
        <div className="card">
          <h3>My Reviews</h3>
          <p className="muted">{reviewsList.length} reviews</p>

          {reviewsList.length > 0 ? (
            reviewsList.map(function (rev) {
              return <ReviewCard key={rev.id} review={rev} />;
            })
          ) : (
            <p className="muted margin-top-sm">No reviews written yet.</p>
          )}
        </div>

        {/* Settings Links */}
        <div className="card">
          <h3>Account Settings</h3>
          <div className="settings-links">
            <button
              className="link-btn"
              onClick={function () {
                if (props.navigate) {
                  props.navigate("/edit-profile");
                }
              }}
            >
              Edit Profile Details
            </button>
            <button
              className="link-btn"
              onClick={function () {
                if (props.navigate) {
                  props.navigate("/verification");
                }
              }}
            >
              ID & Student Verification
            </button>
            <button
              className="link-btn"
              onClick={function () {
                if (props.navigate) {
                  props.navigate("/payment-methods");
                }
              }}
            >
              Payment Methods
            </button>
          </div>
        </div>

        <button className="logout-btn" onClick={props.onLogout}>
          Log Out
        </button>
      </div>
    </div>
  );
}