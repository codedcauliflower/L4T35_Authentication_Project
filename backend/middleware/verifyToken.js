const jwt = require('jsonwebtoken');
require('dotenv').config();


// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract token from Authorization header
  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = decoded; // Attach user info to request
    next(); // Proceed to the next middleware
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};


module.exports = verifyToken;