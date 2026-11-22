
import { useState } from "react";
import { useParams } from "react-router-dom";
import "./ReviewForm.css";

function ReviewForm({ userId, userName }) {
    const { targetUserId } = useParams();

    const [rating, setRating] = useState("");
    const [comment, setComment] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!userId) {
            setError("Please log in to leave a review.");
            return;
        }
        if (!targetUserId) {
            setError("Please select a user to review.");
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch("/api/reviews", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId,
                },
                body: JSON.stringify({
                    targetUserId,
                    rating: Number(rating),
                    text: comment,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Could not submit review.");
            }

            setSubmitted(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="review-form">
            <h2>Leave a Review</h2>

            {userName && <p>How was your experience with {userName}?</p>}

            {submitted ? (
                <div className="review-result">
                    <p>Review submitted!</p>
                    <p>Rating: {rating}/5 stars</p>
                    <p>{comment}</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <label htmlFor="rating">Rating</label>
                    <select
                        id="rating"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        required
                    >
                        <option value="">Select a rating</option>
                        <option value="1">1 Star</option>
                        <option value="2">2 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="5">5 Stars</option>
                    </select>

                    <label htmlFor="comment">Your Review</label>
                    <textarea
                        id="comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write about your experience..."
                        rows="5"
                        required
                    />

                    {error && <p role="alert">{error}</p>}

                    <button type="submit" disabled={submitting}>
                        {submitting ? "Submitting..." : "Add Review"}
                    </button>
                </form>
            )}
        </div>
    );
}
export default ReviewForm;


