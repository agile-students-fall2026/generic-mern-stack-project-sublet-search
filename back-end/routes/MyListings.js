import express from 'express' 
import multer from "multer";
import path from "path";
import fs from "fs";
import listings from "../data/listings.js";
import paymentMethods from "../data/paymentMethods.js";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatDate = date => {
    const [year, month, day] = date.split("-");
    return `${months[Number(month) - 1]} ${Number(day)}`;
};

const formatPrice = amount => `$${amount.toLocaleString("en-US")}`;

const router = express.Router();

router.use((req, res, next) => {
    req.userId = req.header("x-user-id") || "user1";
    next();
});

router.get("/api/users/me/listings", (req,res) => {
    const myListing = listings.filter(listing => listing.ownerId === req.userId);
    res.json({
        active: myListing.filter(listing => listing.active),
        past: myListing.filter(listing => !listing.active),
    });
});

router.delete("/api/users/me/listings/:listingId", (req,res) => {
    const index = listings.findIndex(listing => listing.id === Number(req.params.listingId));
    if (index === -1){
        return res.status(404).json({ error: "Listing not found." });
    }
    if (listings[index].ownerId != req.userId){
        return res.status(403).json({ error: "You can only delete your own listings." });
    }
    listings.splice(index, 1);
    res.status(204).end();
});

router.put("/api/listings/:listingId", (req, res) => {
    const listing = listings.find(listing => listing.id === Number(req.params.listingId));

    if (!listing) {
        return res.status(404).json({ error: "Listing not found." });
    }
    if (listing.ownerId !== req.userId) {
        return res.status(403).json({ error: "You can only edit your own listings." });
    }

    const allowed = ["title", "location", "price", "availability", "startDate", "endDate", "description", "image", "photos", "active"];
    for (const field of allowed) {
        if (req.body[field] !== undefined) {
            listing[field] = req.body[field];
        }
    }

    res.json(listing);
});

router.get("/api/listings/:listingId", (req,res) => {
    const listing = listings.find(listing => listing.id === Number(req.params.listingId));

    if (!listing || (!listing.active && listing.ownerId !== req.userId)) {
        return res.status(404).json({ error: "Listing not found." });
    }
    res.json({ ...listing, photos: listing.photos || [listing.image] });
});

fs.mkdirSync("public/uploads", { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "public/uploads"),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `${file.fieldname}-${unique}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith("image/")), 
});

router.post("/api/uploads/listing-images", upload.array("photos", 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No images uploaded." });
    }

    const urls = req.files.map(file => `/uploads/${file.filename}`);
    res.status(201).json({ urls: urls });
});

router.post("/api/listings", (req,res) => {
    const { title, location, price, startDate, endDate, description, photos } = req.body;

    if (!title || !location || price === undefined || !startDate || !endDate) {
        return res.status(400).json({ error: "Title, location, price, start date, and end date are required." });
    }
    if (!Array.isArray(photos) || photos.length === 0) {
        return res.status(400).json({ error: "At least one photo is required." });
    }

    const amount = Number(String(price).replace(/[$,]/g, ""));
    if (Number.isNaN(amount) || amount < 0) {
        return res.status(400).json({ error: "Price must be a number that is 0 or more." });
    }
    if (startDate > endDate) {
        return res.status(400).json({ error: "Start date must be on or before end date." });
    }

    const newListing = {
        id: Math.max(0, ...listings.map(listing => listing.id)) + 1,
        ownerId: req.userId,
        active: true,
        title: title,
        location: location,
        availability: `${formatDate(startDate)} – ${formatDate(endDate)}`,
        startDate: startDate,
        endDate: endDate,
        price: formatPrice(amount),
        description: description || "",
        image: photos[0], 
        photos: photos,
    };

    listings.push(newListing);
    res.status(201).json(newListing);
});

router.get("/api/users/me/payment-methods", (req, res) => {
    const card = paymentMethods
        .filter(method => method.userId === req.userId)
        .map(({ userId, ...method }) => method); 
    res.json(card);
});

export default router;