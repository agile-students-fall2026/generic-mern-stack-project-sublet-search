import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./ViewDetails.css";

const API = "http://localhost:3000";
const imageUrl = path => (path?.startsWith("/uploads") ? `${API}${path}` : path);

const ViewDetails = ({ userId }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [listing, setListing] = useState(null);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function fetchListing() {
            setLoading(true);
            setError("");
            setListing(null);
            setPhotoIndex(0);

            try {
                const response = await fetch(`${API}/api/listings/${id}`, {
                    headers: userId ? { "x-user-id": userId } : {},
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error(
                        response.status === 404
                            ? "Listing not found."
                            : "Could not load listing."
                    );
                }

                const data = await response.json();
                setListing(data);
            } catch (err) {
                if (!controller.signal.aborted) {
                    setError(err.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }
        fetchListing();

        return () => controller.abort();
    }, [id, userId]);

    if (loading) {
        return (
            <main className="ListingDetails">
                <p>Loading listing...</p>
            </main>
        );
    }

    if (!listing) {
        return (
            <main className="ListingDetails">
                <button
                    type="button"
                    className="ListingDetails-back"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                <p>{error || "Sorry, we couldn't find that listing."}</p>
            </main>
        );
    }

    const photos = listing.photos?.length
        ? listing.photos
        : listing.image
            ? [listing.image]
            : [];

    const ownerId = listing.ownerId || listing.userId;

    return (
        <main className="ListingDetails">
            <button
                type="button"
                className="ListingDetails-back"
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            {photos.length > 0 && (
                <img
                    className="ListingDetails-mainImg"
                    src={imageUrl(photos[photoIndex])}
                    alt={`${listing.title}, photo ${photoIndex + 1}`}
                />
            )}

            {photos.length > 1 && (
                <div className="ListingDetails-thumbs">
                    {photos.map((photo, index) => (
                        <img
                            key={photo}
                            className={index === photoIndex ? "ListingDetails-thumb selected" : "ListingDetails-thumb"}
                            src={imageUrl(photo)}
                            alt={`Photo ${index + 1}`}
                            onClick={() => setPhotoIndex(index)}
                        />
                    ))}
                </div>
            )}

            <h1>{listing.title}</h1>
            <p className="ListingDetails-price">{listing.price} / month</p>

            <section className="ListingDetails-section">
                <h2>Location</h2>
                <p>{listing.location}</p>
            </section>

            <section className="ListingDetails-section">
                <h2>Availability</h2>
                <p>{listing.availability}</p>
            </section>

            {listing.description && (
                <section className="ListingDetails-section">
                    <h2>Description</h2>
                    <p>{listing.description}</p>
                </section>
            )}

            {userId && ownerId && String(userId) !== String(ownerId) && (
                <button
                    type="button"
                    onClick={() => navigate(`/app/reviewForm/${ownerId}`)}
                >
                    Leave a Review
                </button>
            )}
        </main>
    );
};

export default ViewDetails;