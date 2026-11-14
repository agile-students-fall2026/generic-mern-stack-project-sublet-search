import express from 'express';
import listings from "./data/listings.js";

const app = express();

app.use(express.json());

app.get("/api/listings", (req, res) => {
    res.json(listings);
});

export default app;
