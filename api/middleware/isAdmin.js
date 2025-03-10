const isAdmin = (req, res, next) => {
    const { token } = req.cookies;
  
    if (!token) {
      console.log("No token found"); // Debugging log
      return res.status(401).json({ error: "Unauthorized" });
    }
  
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) {
        console.log("Invalid token:", err); // Debugging log
        return res.status(401).json({ error: "Invalid token" });
      }
  
      if (userData.role !== "admin") {
        console.log("User is not an admin:", userData); // Debugging log
        return res.status(403).json({ error: "Forbidden: Admin access required" });
      }
  
      req.user = userData;
      next();
    });
  };