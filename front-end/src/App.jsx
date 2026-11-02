
import { useState } from "react";
import "./App.css";
import Explore from "./pages/Explore";
import LeaseMessaging from "./components/LeaseMessaging";
import ReviewForm from "./components/ReviewForm";

function App() {
  const [page, setPage] = useState("explore");

  return (
    <div className="app">
      <header>
        <h1>Sublet Search</h1>

        <nav>
          <button onClick={() => setPage("explore")}>
            Explore
          </button>

          <button onClick={() => setPage("messages")}>
            Messages
          </button>

          <button onClick={() => setPage("reviews")}>
            Reviews
          </button>
        </nav>
      </header>

      <main>
        {page === "explore" && <Explore />}

        {page === "messages" && <LeaseMessaging />}

        {page === "reviews" && <ReviewForm userName="Alex" />}
      </main>
    </div>
  );
}

export default App;
