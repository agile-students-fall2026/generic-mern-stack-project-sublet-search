import ListingCard from "./components/ListingCard";
import "./App.css";

function App() {
  const testListing = {
    title: "Brooklyn Apartment",
    location: "Williamsburg, Brooklyn",
    price: "$1,650",
    roommates: 2,
    image: "/images/sublet-sample-apartment.webp"
  };

  return (
    <div className="app">
      <header>
        <h1>Sublet Search</h1>
      </header>

      <main>
        <h2>Explore Sublets</h2>
        <ListingCard listing={testListing} />
      </main>
    </div>
  );
}

export default App;
