const express = require('express');
const router = express.Router();

const { authorizeRoles } = require('../middleware/auth');

const User = require('../models/User'); // Assuming you have a User model
const Division = require('../models/Division'); // Assuming you have a Division model
const OU = require('../models/OU'); // Assuming you have an OU model

// Fetch all users (GET request)
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .populate('divisionsAndOUs.division', 'name') // Populate division name
      .populate('divisionsAndOUs.ou', 'name');     // Populate OU name
    
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch a specific user with their Divisions and OUs (GET request)
router.get('/:userId',  async (req, res) => {
  try {
    // Find the user and populate the divisionsAndOUs field
    const user = await User.findById(req.params.userId)
      .populate('divisionsAndOUs.division', 'name') // Populate division name
      .populate('divisionsAndOUs.ou', 'name');     // Populate OU name

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        divisionsAndOUs: user.divisionsAndOUs.map(pair => ({
          _id: pair._id,
          division: pair.division.name, // Name of the division
          ou: pair.ou.name              // Name of the OU
        }))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Assign user to Division and OU (POST request)
router.post('/:userId/add-division', authorizeRoles('admin'), async (req, res) => {
  const { userId } = req.params;
  const { division, ou } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if the division-OU pair already exists
    const exists = user.divisionsAndOUs.some(d => d.division.toString() === division && d.ou.toString() === ou);
    if (exists) return res.status(400).json({ message: 'Division-OU pair already exists' });

    // Validate if the division and OU exist
    const divisionObj = await Division.findById(division);
    const ouObj = await OU.findById(ou);

    if (!divisionObj || !ouObj) {
      return res.status(400).json({ message: 'Invalid division or OU' });
    }

    // Add new division-OU pair
    user.divisionsAndOUs.push({ division, ou });
    await user.save();

    res.json({ success: true, message: 'Division-OU pair added successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Remove Division and OU from User (DELETE request)
router.delete('/:userId/remove-division', authorizeRoles('admin'), async (req, res) => {
  const { userId } = req.params;
  const { division, ou } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Remove only the specific division-OU pair
    const pairIndex = user.divisionsAndOUs.findIndex(d => d.division.toString() === division && d.ou.toString() === ou);

    if (pairIndex === -1) {
      return res.status(400).json({ message: 'Division-OU pair not found' });
    }

    // Ensure at least one pair remains
    if (user.divisionsAndOUs.length <= 1) {
      return res.status(400).json({ message: 'At least one Division-OU pair must remain' });
    }

    // Remove the pair
    user.divisionsAndOUs.splice(pairIndex, 1);
    await user.save();

    res.json({ success: true, message: 'Division-OU pair removed successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Change user role (PUT request)
router.put('/:userId/role', authorizeRoles('admin'), async (req, res) => {
  const { userId } = req.params;
  const { newRole } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Change the user's role
    user.role = newRole;

    await user.save();

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
