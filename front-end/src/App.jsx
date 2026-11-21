
import React, { useState, useEffect } from "react";
import axios from "axios";

import Login from "./pages/Login";
import Layout from "./pages/Layout";
import Signup from "./pages/Signup";
import Explore from "./pages/Explore";
import ReviewForm from "./components/ReviewForm";
import Messages from "./pages/Messages";
import PostSubletPage from "./pages/PostSubletPage";
import Profile from "./pages/Profile";
import MyListings from "./pages/MyListings";
import SavedListings from "./pages/SavedListings";
import ViewDetails from "./pages/ViewDetails";
import EditProfile from "./pages/EditProfile";
import Verification from "./pages/Verification";
import PaymentMethods from "./pages/PaymentMethods";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import "./App.css";

function App() {
    const [savedListings, setSavedListings] = useState([]);

    const savedIds = savedListings.map(listing => listing.id);

    const [user, setUser] = useState(() => {
        try {
            const raw = localStorage.getItem("user");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path = "/app" element ={<Layout/>}>
          <Route index element = {<Login onLogin={setUser} />} />
          <Route
            path="explore"
            element={<Explore savedIds={savedIds} onToggleSave={toggleSave} />}
          />
          <Route path = "reviewForm" element = {<ReviewForm />} />
          <Route path = "signUp" element = {<Signup />} />
          <Route path = "messages" element = {<Messages />} />
          <Route path = "post" element = {<PostSubletPage />} />
          <Route path="my-listings" element={<MyListings />} /> 
          <Route path="profile" element={<Profile user={user} savedIds={savedIds} onLogout={handleLogout} /> }
          />
          <Route path="listings/:id" element={<ViewDetails />} />
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="verification" element={<Verification />} />
          <Route path="payment-methods" element={<PaymentMethods />} />
          <Route
            path="saved"
            element={<SavedListings savedIds={savedIds} onToggleSave={toggleSave} />}
          />
        </Route>
        
        <Route path = "/" element = {<Login onLogin={setUser} />} />
        <Route path = "/signUp" element = {<Signup />} />
       
      </Routes>
    </BrowserRouter>
  );
}

    useEffect(() => {
        async function fetchSavedListings() {
            try {
                const response = await axios.get("/api/saved");
                setSavedListings(response.data);
            } catch (error) {
                console.error("Error fetching saved listings:", error);
            }
        }

        fetchSavedListings();
    }, []);

    function handleLogout() {
        localStorage.removeItem("user");
        setUser(null);
    }

    async function toggleSave(id) {
        try {
            if (savedIds.includes(id)) {
                await axios.delete(`/api/saved/${id}`);
            } else {
                await axios.post(`/api/saved/${id}`);
            }

            const response = await axios.get("/api/saved");
            setSavedListings(response.data);
        } catch (error) {
            console.error("Error updating saved listings:", error);
        }
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/app" element={<Layout />}>
                    <Route index element={<Login onLogin={setUser} />} />

                    <Route
                        path="explore"
                        element={
                            <Explore
                                savedIds={savedIds}
                                onToggleSave={toggleSave}
                            />
                        }
                    />

                    <Route path="reviewForm" element={<ReviewForm />} />
                    <Route path="signUp" element={<Signup />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="post" element={<PostSubletPage />} />

                    <Route
                        path="my-listings"
                        element={<MyListings />}
                    />

                    <Route
                        path="profile"
                        element={
                            <Profile
                                user={user}
                                savedIds={savedIds}
                                onLogout={handleLogout}
                            />
                        }
                    />

                    <Route
                        path="listings/:id"
                        element={<ViewDetails />}
                    />

                    <Route
                        path="saved"
                        element={
                            <SavedListings
                                savedListings={savedListings}
                                onToggleSave={toggleSave}
                            />
                        }
                    />
                </Route>

                <Route
                    path="/"
                    element={<Login onLogin={setUser} />}
                />

                <Route path="/signUp" element={<Signup />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
