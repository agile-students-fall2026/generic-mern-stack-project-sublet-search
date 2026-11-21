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
app. use("/uploads", express.static ("public/uploads"));

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

export default app;
