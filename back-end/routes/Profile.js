import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import users from "../data/users.js";
import listings from "../data/listings.js";
import reviews from "../data/reviews.js";

const app = express.Router();

const publicUser = ({ password, ...rest }) => rest;

const AVATAR_DIR = "public/uploads/avatars";
const AVATAR_URL_PREFIX = "/uploads/avatars/";
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, AVATAR_DIR),
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      cb(null, `avatar-${unique}${path.extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
}).single("photo");

// Delete a previously uploaded avatar file (never touches external URLs).
function removeAvatarFile(photo) {
  if (typeof photo !== "string" || !photo.startsWith(AVATAR_URL_PREFIX)) return;
  fs.unlink(path.join(AVATAR_DIR, path.basename(photo)), () => {});
}

app.use((req, res, next) => {
  req.userId = req.header("x-user-id") || "user1";
  next();
});

app.get("/api/users/me", (req, res) => {
  const user = users.find((u) => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  res.json(publicUser(user));
});

app.put("/api/users/me", (req, res) => {
  const user = users.find((u) => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const allowed = ["name", "bio", "school", "city", "photo"];

  for (const field of allowed) {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  }

  res.json(publicUser(user));
});

app.post("/api/users/me/photo", (req, res) => {
  const user = users.find((u) => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  avatarUpload(req, res, (err) => {
    if (err) {
      const tooBig = err.code === "LIMIT_FILE_SIZE";
      return res
        .status(tooBig ? 413 : 400)
        .json({ error: tooBig ? "Image must be 5 MB or smaller." : "Upload failed." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Please choose an image file." });
    }

    removeAvatarFile(user.photo);
    user.photo = `${AVATAR_URL_PREFIX}${req.file.filename}`;
    res.status(201).json(publicUser(user));
  });
});

app.delete("/api/users/me/photo", (req, res) => {
  const user = users.find((u) => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  removeAvatarFile(user.photo);
  user.photo = "";
  res.json(publicUser(user));
});

app.put("/api/users/me/verifications", (req, res) => {
  const user = users.find((u) => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const allowed = ["eduEmail", "govId", "phone"];

  for (const field of allowed) {
    if (typeof req.body[field] === "boolean") {
        user.verifications[field] = req.body[field];
    }
  }

  res.json(publicUser(user));
});

app.get("/api/users/me/listings", (req, res) => {
  const userListings = listings.filter(
    (listing) => String(listing.ownerId || listing.userId) === String(req.userId)
  );

  res.json({
    active: userListings.filter((listing) => listing.active !== false),
    past: userListings.filter((listing) => listing.active === false),
  });
});

app.delete("/api/users/me/listings/:listingId", (req, res) => {
  const index = listings.findIndex(
    (listing) =>
      String(listing.id) === String(req.params.listingId) &&
      String(listing.ownerId || listing.userId) === String(req.userId)
  );

  if (index === -1) {
    return res.status(404).json({ error: "Listing not found." });
  }

  listings.splice(index, 1);
  res.json({ success: true });
});

app.get("/api/users/me/saved-listings", (req, res) => {
  const user = users.find((u) => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const saved = listings.filter((listing) =>
    (user.savedListingIds || []).includes(listing.id) && listing.active !== false
  );

  res.json(saved);
});

app.post("/api/users/me/saved-listings/:listingId", (req, res) => {
  const user = users.find((u) => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (!Array.isArray(user.savedListingIds)) {
    user.savedListingIds = [];
  }

  const listingId = Number(req.params.listingId);
  const exists = user.savedListingIds.includes(listingId);

  if (exists) {
    user.savedListingIds = user.savedListingIds.filter((id) => id !== listingId);
  } else {
    user.savedListingIds.push(listingId);
  }

  res.json({ savedListingIds: user.savedListingIds });
});

app.get("/api/saved", (req, res) => {
  const user = users.find((u) => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const savedListings = listings.filter((listing) =>
    (user.savedListingIds || []).includes(listing.id) && listing.active !== false
  );

  res.json(savedListings);
});

app.post("/api/saved/:listingId", (req, res) => {
  const user = users.find((u) => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const listingId = Number(req.params.listingId);

  if (!listings.some((listing) => listing.id === listingId && listing.active !== false)) {
    return res.status(404).json({ error: "Listing not found" });
  }

  if (!Array.isArray(user.savedListingIds)) {
    user.savedListingIds = [];
  }

  if (!user.savedListingIds.includes(listingId)) {
    user.savedListingIds.push(listingId);
  }

  res.json(user.savedListingIds);
});

app.delete("/api/saved/:listingId", (req, res) => {
  const user = users.find((u) => u.id === req.userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const listingId = Number(req.params.listingId);

  user.savedListingIds = (user.savedListingIds || []).filter(
    (id) => id !== listingId
  );

  res.json(user.savedListingIds);
});

app.get("/api/users/me/reviews", (req, res) => {
  const myReviews = reviews.filter((review) => review.targetUserId === req.userId);
  res.json(myReviews);
});

app.get("/api/users/:userId/reviews/received", (req, res) => {
  const userId = req.params.userId;
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const receivedReviews = reviews.filter(
    (review) => review.targetUserId === userId
  );

  res.json(receivedReviews);
});

app.get("/api/users/:userId/reviews/submitted", (req, res) => {
  const userId = req.params.userId;
  const user = users.find((u) => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const submittedReviews = reviews.filter(
    (review) => review.authorUserId === userId
  );

  res.json(submittedReviews);
});



app.post("/api/reviews", (req, res) => {
  const { targetUserId, rating, text } = req.body || {};

  const author = users.find((user) => user.id === req.userId);
  const target = users.find((user) => user.id === targetUserId);

  if (!author || !target) {
    return res.status(404).json({ error: "User not found." });
  }

  if (author.id === target.id) {
    return res.status(400).json({ error: "You cannot review yourself." });
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5 ||
    typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ error: "Enter a valid rating and review." });
  }

  const review = {
    id: Math.max(0, ...reviews.map((review) => review.id)) + 1,
    targetUserId: target.id,
    authorUserId: author.id,
    author: author.name,
    date: new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    rating,
    text: text.trim(),
    likes: 0,
    likedBy: [],
  };

  reviews.push(review);
  res.status(201).json(review);
});


app.post("/api/reviews/:reviewId/like", (req, res) => {
  const reviewId = Number(req.params.reviewId);
  const review = reviews.find((review) => review.id === reviewId);

  if (!review) {
    return res.status(404).json({ error: "Review not found" });
  }

  if (!review.likedBy.includes(req.userId)) {
    review.likedBy.push(req.userId);
    review.likes++;
  }

  res.json(review);
});

app.post("/api/auth/logout", (req, res) => {
  res.status(204).end();
});

app.get("/api/users/me/payment-methods", (req, res) => {
  const user = users.find((u) => String(u.id) === String(req.userId));

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (!Array.isArray(user.paymentMethods)) {
    user.paymentMethods = [
        { id: "pm1", type: "Card", label: "Visa", last4: "4242", expiry: "08/28", isDefault: true },
    ];
  }

  res.json(user.paymentMethods);
});

app.post("/api/users/me/payment-methods", (req, res) => {
  const user = users.find((u) => String(u.id) === String(req.userId));

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  if (!Array.isArray(user.paymentMethods)) {
    user.paymentMethods = [];
  }

  const newMethod = {
    id: `pm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: req.body.type || "Card",
    label: req.body.label,
    last4: req.body.last4,
    expiry: req.body.expiry || "",
    isDefault: user.paymentMethods.length === 0,
  };

  user.paymentMethods.push(newMethod);
  res.status(201).json(user.paymentMethods);
});

app.put("/api/users/me/payment-methods/:methodId/default", (req, res) => {
  const user = users.find((u) => String(u.id) === String(req.userId));

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  user.paymentMethods = (user.paymentMethods || []).map((method) => ({
    ...method,
    isDefault: String(method.id) === String(req.params.methodId),
  }));

  res.json(user.paymentMethods);
});

app.delete("/api/users/me/payment-methods/:methodId", (req, res) => {
  const user = users.find((u) => String(u.id) === String(req.userId));

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  user.paymentMethods = (user.paymentMethods || []).filter(
    (method) => String(method.id) !== String(req.params.methodId)
  );

  res.json(user.paymentMethods);
});

export default app;
