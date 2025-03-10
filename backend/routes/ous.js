const express = require('express');
const router = express.Router();
const OU = require('../models/OU');

// Get all OUs
router.get('/', async (req, res) => {
  try {
    const ous = await OU.find(); // Fetch all OUs from the database
    res.json(ous); // Return the OUs as a JSON response
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
