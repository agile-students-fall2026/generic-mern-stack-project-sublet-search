import "./App.css";
import Explore from "./pages/Explore";
import PostSubletPage from "./pages/PostSubletPage";

function App() {
  return (
    <div className="app">
      <header>
        <h1>Sublet Search</h1>
      </header>

      <main>
        <Explore />
        <PostSubletPage/>
        
      </main>
    </div>
  );
}

export default App;
