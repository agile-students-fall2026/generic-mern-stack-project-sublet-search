import express from 'express';
import users from "../data/users.js";

const router = express.Router();

router.post("/api/signup", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const existing = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (existing) {
        return res.status(409).json({ error: "An account with this email already exists." });
    }

    const newUser = {
        id: `user${Math.max(0, ...users.map(u => Number(String(u.id).replace(/\D/g, "")) || 0)) + 1}`,
        name,
        email: email.toLowerCase(),
        password,
        bio: "",
        school: "",
        city: "",
        photo: "",
        verifications: { eduEmail: false, govId: false, phone: false },
        savedListingIds: [],
    };

    users.push(newUser);

    res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
    });
});

router.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    const user = users.find(
        user => user.email.toLowerCase() === email.toLowerCase() && user.password === password
    );

    if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
    }

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
    });
});

router.post("/api/forgot-password", (req, res) => {
    const { email } = req.body ?? {};

    if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({ error: "Email is required." });
    }

    return res.json({
        message: "Demo reset request received. No email was sent.",
    });
});

export default router;