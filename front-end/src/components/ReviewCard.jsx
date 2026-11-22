
import { useState } from "react";
import "./ReviewCard.css";

function ReviewCard({ review, userId }) {
  const [updatedReview, setUpdatedReview] = useState(null);
  const [error, setError] = useState("");
  const [liking, setLiking] = useState(false);

  const currentReview = updatedReview?.id === review.id ? updatedReview : review;
  const likes = currentReview.likes || 0;
  const likedBy = currentReview.likedBy || [];
  const liked = Boolean(userId && likedBy.includes(userId));

  async function handleLike() {
    if (!userId || liked || liking) {
      return;
    }

    setError("");
    setLiking(true);

    try {
      const response = await fetch(`/api/reviews/${review.id}/like`, {
        method: "POST",
        headers: {
          "x-user-id": userId,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not like review.");
      }

      setUpdatedReview(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLiking(false);
    }
  }

  return (
    <div className="review-card">
      <div className="review-header">
        <img
          alt={currentReview.author}
          className="review-avatar"
        />

        <div className="review-author-info">
          <h3>{currentReview.author}</h3>
          <p className="review-date">{currentReview.date}</p>
        </div>

        <div className="review-rating">
          {"★".repeat(currentReview.rating || 5)}
        </div>
      </div>

      <div className="review-info">
        <p className="review-text">"{currentReview.text}"</p>
      </div>

      <div className="review-buttons">
        <button
          type="button"
          className="like-button"
          onClick={handleLike}
          disabled={!userId || liked || liking}
        >
          {liked ? "Liked" : "Like"} ({likes})
        </button>
      </div>

      {error && <p role="alert">{error}</p>}
    </div>
  );
}

export default ReviewCard;
