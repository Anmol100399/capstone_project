const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Models
const UserModel = require("./models/User");
const Event = require("./models/Event");

const app = express();

// Constants
const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.error("JWT_SECRET is not defined in .env file");
  process.exit(1);
}

// Middleware
app.use(
  cors({
    credentials: true,
    origin: ["https://memorable-moments.vercel.app"],
  })
);
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, jwtSecret, {}, (err, userData) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    if (userData.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    req.user = userData;
    next();
  });
};

// Admin Login Route
app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const adminDoc = await UserModel.findOne({ email, role: "admin" });
    if (!adminDoc) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const passOk = bcrypt.compareSync(password, adminDoc.password);
    if (!passOk) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT token
    jwt.sign(
      { email: adminDoc.email, id: adminDoc._id, role: adminDoc.role },
      jwtSecret,
      {},
      (err, token) => {
        if (err) {
          return res.status(500).json({ error: "Failed to generate token" });
        }
        // Send token in response
        res.cookie("token", token).json({ token, admin: adminDoc.toObject() });
      }
    );
  } catch (e) {
    console.error("Admin login error:", e);
    res.status(500).json({ error: "Admin login failed" });
  }
});

// User Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const userDoc = await UserModel.findOne({ email, role: { $ne: "admin" } }); // Ensure only non-admin users can login
    if (!userDoc) {
      return res.status(404).json({ error: "User not found" });
    }

    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (!passOk) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT token
    jwt.sign(
      { email: userDoc.email, id: userDoc._id, role: userDoc.role },
      jwtSecret,
      {},
      (err, token) => {
        if (err) {
          return res.status(500).json({ error: "Failed to generate token" });
        }
        // Send token in response
        res.cookie("token", token).json({ token, user: userDoc.toObject() });
      }
    );
  } catch (e) {
    console.error("User login error:", e);
    res.status(500).json({ error: "User login failed" });
  }
});

// Admin Dashboard Route (Fetch All Events)
app.get("/admin/events", isAdmin, async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

// Approve Event Route
app.post("/event/:eventId/approve", isAdmin, async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findByIdAndUpdate(
      eventId,
      { status: "Approved" },
      { new: true }
    );
    res.json(event);
  } catch (error) {
    console.error("Error approving event:", error);
    res.status(500).json({ error: "Failed to approve event" });
  }
});

// Reject Event Route
app.post("/event/:eventId/reject", isAdmin, async (req, res) => {
  const { eventId } = req.params;
  const { rejectionReason } = req.body;

  try {
    const event = await Event.findByIdAndUpdate(
      eventId,
      { status: "Rejected", rejectionReason },
      { new: true }
    );
    res.json(event);
  } catch (error) {
    console.error("Error rejecting event:", error);
    res.status(500).json({ error: "Failed to reject event" });
  }
});

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});