const jwt = require('jsonwebtoken');

// Middleware to verify user roles
const verifyRole = (allowedRoles) => (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ message: "Forbidden: You don't have permission" });
    }

    req.user = decoded; // Attach user info to the request
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = verifyRole;