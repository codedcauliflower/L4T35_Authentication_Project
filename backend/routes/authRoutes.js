const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
  const { username, password, role, division, ou } = req.body;

  try {
    // Check if the username already exists
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user with an array of division-OU pairs
    const newUser = new User({
      username,
      password: hashedPassword,
      role: role || 'user', // Default to 'user' if no role is provided
      divisionsAndOUs: [{ division, ou }] // Store division-OU as an array of objects
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Login User
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    // If user not found or password doesn't match
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with both id and role
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send response with the generated token and user details
    res.json({
      message: 'Login successful',
      token,
      user: { // Include the user details you want
        _id: user._id,
        username: user.username,
        role: user.role,
        divisionsAndOUs: user.divisionsAndOUs, // If needed, you can add more details here
      }
    });
  } catch (error) {
    // Handle any unexpected errors
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});


module.exports = router;