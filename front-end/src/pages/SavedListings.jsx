
import "./Explore.css";
import ListingCard from "../components/ListingCard";

function SavedListings({ savedListings, onToggleSave }) {
    return (
        <div className="explore-page">
            <h2>Saved Listings</h2>

            {savedListings.length === 0 ? (
                <p>You haven't saved any listings yet.</p>
            ) : (
                <div className="listings">
                    {savedListings.map(listing => (
                        <ListingCard
                            key={listing.id}
                            listing={listing}
                            saved={true}
                            onToggleSave={onToggleSave}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default SavedListings;
