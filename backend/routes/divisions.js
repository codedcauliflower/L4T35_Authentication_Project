const express = require('express');
const router = express.Router();
const Division = require('../models/Division');

// Get divisions by specific OU
router.get('/', async (req, res) => {
  try {
    const ouId = req.query.ou;  // Get the 'ou' query parameter from the request

    // Validate that ouId is provided if necessary
    if (!ouId) {
      return res.status(400).json({ message: 'OU ID is required' });
    }

    // Find divisions that match the OU
    const divisions = await Division.find({ ou: ouId }).populate('ou');  // Fetch divisions by OU


    // Check if any divisions were found
    if (divisions.length === 0) {
      return res.status(404).json({ message: `No divisions found for this OU: ${divisions}` });
    }

    // Return the divisions as a JSON response
    res.json({
      success: true,
      message: 'Divisions fetched successfully',
      divisions
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });  // Handle any errors that occur
  }
});

module.exports = router;
