const jwt = require("jsonwebtoken");

const verifyRole = (roles) => (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract the token from headers
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }

    // Check if the user's role is one of the allowed roles
    if (!roles.includes(decoded.role)) {
      return res
        .status(403)
        .json({ message: "Access denied: Insufficient permissions" });
    }

    // Attach user info to the request object for later use
    req.user = decoded;
    next();
  });
};

module.exports = verifyRole;
