import express from "express";
import users from "../data/users.js";
import listings from "../data/listings.js";
import reviews from "../data/reviews.js";

const app = express.Router();

app.use((req, res, next) => {
  req.userId = req.header("x-user-id") || "user1";
  next();
});

app.get("/api/users/me", (req, res) => {
  const user = users.find((u) => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }
  res.json(user);
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

  res.json(user);
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
  
    res.json(user);
  });

  app.get("/api/users/me/listings", (req, res) => {
    const userListings = listings.filter(
      (l) => String(l.ownerId || l.userId) === String(req.userId)
    );
  
    res.json({
      active: userListings.filter((l) => l.active !== false),
      past: userListings.filter((l) => l.active === false),
    });
  });

  app.delete("/api/users/me/listings/:listingId", (req, res) => {
    const idx = listings.findIndex(
      (l) =>
        String(l.id) === String(req.params.listingId) &&
        String(l.ownerId || l.userId) === String(req.userId)
    );
  
    if (idx === -1) {
      return res.status(404).json({ error: "Listing not found." });
    }
  
    listings.splice(idx, 1);
    res.json({ success: true });
  });
  
app.get("/api/users/me/saved-listings", (req, res) => {
  const user = users.find((u) => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const saved = listings.filter(
    (listing) => user.savedListingIds.includes(listing.id) && listing.active
  );
  res.json(saved);
});

app.post("/api/users/me/saved-listings/:listingId", (req, res) => {
  const user = users.find((u) => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
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


app.get("/api/users/me/reviews", (req, res) => {
  const myReviews = reviews.filter((r) => r.targetUserId === req.userId);
  res.json(myReviews);
});

app.post("/api/auth/logout", (req, res) => {
  res.status(204).end();
});

app.get("/api/users/me/payment-methods", (req, res) => {
  const user = users.find((u) => String(u.id) === String(req.userId));
  if (!user) return res.status(404).json({ error: "User not found." });

  if (!Array.isArray(user.paymentMethods)) {
    user.paymentMethods = [
      { id: "pm1", type: "Card", label: "Visa", last4: "4242", expiry: "08/28", isDefault: true },
    ];
  }
  res.json(user.paymentMethods);
});

app.post("/api/users/me/payment-methods", (req, res) => {
  const user = users.find((u) => String(u.id) === String(req.userId));
  if (!user) return res.status(404).json({ error: "User not found." });

  if (!Array.isArray(user.paymentMethods)) user.paymentMethods = [];

  const newMethod = {
    id: `pm_${Date.now()}`,
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
  if (!user) return res.status(404).json({ error: "User not found." });

  user.paymentMethods = (user.paymentMethods || []).map((pm) => ({
    ...pm,
    isDefault: String(pm.id) === String(req.params.methodId),
  }));
  res.json(user.paymentMethods);
});

app.delete("/api/users/me/payment-methods/:methodId", (req, res) => {
  const user = users.find((u) => String(u.id) === String(req.userId));
  if (!user) return res.status(404).json({ error: "User not found." });

  user.paymentMethods = (user.paymentMethods || []).filter(
    (pm) => String(pm.id) !== String(req.params.methodId)
  );
  res.json(user.paymentMethods);
});

export default app;