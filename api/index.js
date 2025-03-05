const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");

// Models
const UserModel = require("./models/User");
const Event = require("./models/Event");
const Ticket = require("./models/Ticket");

const app = express();

// Constants
const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.JWT_SECRET || "admin"; // Use environment variable for JWT secret

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
   cors({
      credentials: true,
      origin: "http://localhost:5173", // Allow requests from this origin
   })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve static files from the "uploads" folder

// MongoDB Connection
mongoose
   .connect(process.env.MONGO_URL)
   .then(() => console.log("Connected to MongoDB"))
   .catch((err) => console.error("MongoDB connection error:", err));

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      cb(null, "uploads/");
   },
   filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname); // Add timestamp to filename to avoid conflicts
   },
});

const upload = multer({ storage });

// Routes

// Test Route
app.get("/test", (req, res) => {
   res.json("Server is running");
});

// User Registration
app.post("/register", async (req, res) => {
   const { name, email, password } = req.body;

   if (!name || !email || !password) {
      return res.status(422).json({ error: "All fields are required" });
   }

   try {
      const userDoc = await UserModel.create({
         name,
         email,
         password: bcrypt.hashSync(password, bcryptSalt),
      });
      res.status(201).json(userDoc);
   } catch (e) {
      if (e.code === 11000) {
         res.status(409).json({ error: "Email already exists" });
      } else {
         res.status(500).json({ error: "Registration failed", details: e.message });
      }
   }
});

// User Login
app.post("/login", async (req, res) => {
   const { email, password } = req.body;

   if (!email || !password) {
      return res.status(422).json({ error: "Email and password are required" });
   }

   try {
      const userDoc = await UserModel.findOne({ email });

      if (!userDoc) {
         return res.status(404).json({ error: "User not found" });
      }

      const passOk = bcrypt.compareSync(password, userDoc.password);
      if (!passOk) {
         return res.status(401).json({ error: "Invalid password" });
      }

      jwt.sign(
         { email: userDoc.email, id: userDoc._id },
         jwtSecret,
         {},
         (err, token) => {
            if (err) {
               console.error("JWT error:", err);
               return res.status(500).json({ error: "Failed to generate token" });
            }
            res.cookie("token", token).json(userDoc.toObject());
         }
      );
   } catch (e) {
      console.error("Login error:", e);
      res.status(500).json({ error: "Login failed", details: e.message });
   }
});

// User Profile
app.get("/profile", (req, res) => {
   const { token } = req.cookies;
   if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
   }

   jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) {
         return res.status(401).json({ error: "Invalid token" });
      }
      const { name, email, _id } = await UserModel.findById(userData.id);
      res.json({ name, email, _id });
   });
});

// User Logout
app.post("/logout", (req, res) => {
   res.cookie("token", "").json(true);
});

// Create Event
app.post("/createEvent", upload.single("image"), async (req, res) => {
   try {
      const eventData = req.body;
      eventData.image = req.file ? req.file.path : "";
      const newEvent = new Event(eventData);
      await newEvent.save();
      res.status(201).json(newEvent);
   } catch (error) {
      res.status(500).json({ error: "Failed to save the event to MongoDB" });
   }
});

// Get All Events
app.get("/createEvent", async (req, res) => {
   try {
      const events = await Event.find();
      res.status(200).json(events);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch events from MongoDB" });
   }
});

// Get Event by ID
app.get("/event/:id", async (req, res) => {
   const { id } = req.params;
   try {
      const event = await Event.findById(id);
      if (!event) {
         return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch event from MongoDB" });
   }
});

// Like an Event
app.post("/event/:eventId/like", async (req, res) => {
   const { eventId } = req.params;
   try {
      const event = await Event.findById(eventId);
      if (!event) {
         return res.status(404).json({ error: "Event not found" });
      }
      event.likes += 1;
      await event.save();
      res.json(event);
   } catch (error) {
      res.status(500).json({ error: "Failed to like the event" });
   }
});

// Get All Events (Filtered by Status)
app.get("/events", async (req, res) => {
   const { status } = req.query;
   try {
      const query = status ? { status } : {};
      const events = await Event.find(query);
      res.json(events);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
   }
});

// Approve Event
app.post("/event/:eventId/approve", async (req, res) => {
   const { eventId } = req.params;
   try {
      const event = await Event.findByIdAndUpdate(
         eventId,
         { status: "Approved" },
         { new: true }
      );
      res.json(event);
   } catch (error) {
      res.status(500).json({ error: "Failed to approve event" });
   }
});

// Reject Event
app.post("/event/:eventId/reject", async (req, res) => {
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
      res.status(500).json({ error: "Failed to reject event" });
   }
});

// Delete Event
app.delete("/event/:eventId", async (req, res) => {
   const { eventId } = req.params;
   try {
      await Event.findByIdAndDelete(eventId);
      res.status(204).send();
   } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
   }
});

// Get Order Summary for Event
app.get("/event/:id/ordersummary", async (req, res) => {
   const { id } = req.params;
   try {
      const event = await Event.findById(id);
      if (!event) {
         return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch event from MongoDB" });
   }
});

// Get Payment Summary for Event
app.get("/event/:id/ordersummary/paymentsummary", async (req, res) => {
   const { id } = req.params;
   try {
      const event = await Event.findById(id);
      if (!event) {
         return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch event from MongoDB" });
   }
});

// Create Ticket
app.post("/tickets", async (req, res) => {
   try {
     const ticketDetails = req.body;
     console.log("Received ticket data:", ticketDetails);
 
     // Validate required fields
     if (!ticketDetails.eventid || !ticketDetails.ticketDetails) {
       console.error("Missing required fields");
       return res.status(400).json({ error: "Missing required fields" });
     }
 
     const newTicket = new Ticket(ticketDetails);
     await newTicket.save();
     res.status(201).json(newTicket);
   } catch (error) {
     console.error("Error creating ticket:", error); // Log the error
     res.status(500).json({ error: "Failed to create ticket", details: error.message });
   }
 });

// Get All Tickets
app.get("/tickets", async (req, res) => {
   try {
      const tickets = await Ticket.find();
      res.json(tickets);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch tickets" });
   }
});

// Get Tickets by User ID
app.get("/tickets/user/:userId", async (req, res) => {
   const { userId } = req.params;
   try {
      const tickets = await Ticket.find({ userid: userId });
      res.json(tickets);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch user tickets" });
   }
});

// Delete Ticket
app.delete("/tickets/:id", async (req, res) => {
   const { id } = req.params;
   try {
      await Ticket.findByIdAndDelete(id);
      res.status(204).send();
   } catch (error) {
      res.status(500).json({ error: "Failed to delete ticket" });
   }
});

// Admin: Get All Events
app.get("/admin/events", async (req, res) => {
   try {
      const events = await Event.find();
      res.json(events);
   } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
   }
});

// Get Current User
app.get("/user", async (req, res) => {
   const { token } = req.cookies;
   if (!token) {
     return res.status(401).json({ error: "Unauthorized" });
   }
 
   try {
     const userData = jwt.verify(token, jwtSecret);
     const user = await UserModel.findById(userData.id);
     if (!user) {
       return res.status(404).json({ error: "User not found" });
     }
     res.json({ id: user._id, name: user.name, email: user.email });
   } catch (err) {
     res.status(401).json({ error: "Invalid token" });
   }
 });

// Start Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
});