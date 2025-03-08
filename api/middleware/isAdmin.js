const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const isAdmin = (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  jwt.verify(token, jwtSecret, {}, (err, userData) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Check if the user has the admin role
    if (userData.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    req.user = userData; // Attach user data to the request object
    next(); // Allow access to the admin dashboard
  });
};

module.exports = isAdmin;