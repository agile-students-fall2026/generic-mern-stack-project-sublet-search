import express from 'express';
import listings from "./data/listings.js";
import authRoutes from "./routes/auth.js";
import conversationsRouter from "./routes/ConversationsRouter.js";
import myListingsRouter from "./routes/MyListings.js";
import cors from "cors"
import profileRoutes from "./routes/Profile.js";

const app = express();
app.use(cors())
app.use(express.json());
app.use("/uploads", express.static ("public/uploads"));

app.use((req, res, next) => {
    req.userId = req.header("x-user-id") || "user1";
    next();
});

app.use(authRoutes);
app.use("/api/conversations", conversationsRouter);
app.use(myListingsRouter);

app.get("/api/listings", (req, res) => {
    res.json(listings);
});

app.use(profileRoutes);
const savedIds = [];

app.post("/api/saved/:listingId", (req, res) => {
    const listingId = Number(req.params.listingId);

    if (!listings.some((listing) => listing.id === listingId)) {
        return res.status(404).json({ error: "Listing not found" });
    }

    if (!savedIds.includes(listingId)) {
        savedIds.push(listingId);
    }

    res.json(savedIds);
});

app.delete("/api/saved/:listingId", (req, res) => {
    const listingId = Number(req.params.listingId);
    const index = savedIds.indexOf(listingId);

    if (index !== -1) {
        savedIds.splice(index, 1);
    }

    res.json(savedIds);
})

app.get("/api/saved", (req,res) => {
    const savedListings = listings.filter(listing => savedIds.includes(listing.id));

    res.json(savedListings);
})

export default app;
