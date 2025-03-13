const Credential = require('../models/Credential');
const Division = require('../models/Division');
const User = require('../models/User');


// Fetch all credentials (Admin only)
exports.getAllCredentials = async (req, res) => {
  try {
    const credentials = await Credential.find().populate('division'); 
    return res.json({ success: true, credentials });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// View credentials for divisions/OUs the user belongs to
exports.viewCredentials = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Extract user's divisions & OUs
    const userDivisionsAndOUs = user.divisionsAndOUs; // [{ division, ou }, ...]

    // Find credentials where division-OU matches any of user's pairs
    const credentials = await Credential.find({
      $or: userDivisionsAndOUs.map(pair => ({ division: pair.division, ou: pair.ou }))
    });

    if (credentials.length === 0) {
      return res.status(404).json({ message: 'No credentials found for your divisions/OUs' });
    }

    return res.json({ success: true, credentials });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a credential with (division, OU)
exports.addCredential = async (req, res) => {
  try {
    const { title, username, password, division, ou } = req.body;

    // Check if division exists
    const divisionExists = await Division.findById(division);
    if (!divisionExists) {
      return res.status(400).json({ message: 'Invalid Division ID' });
    }

    // Ensure OU is different from division
    if (ou === division) {
      return res.status(400).json({ message: 'OU and Division cannot be the same' });
    }

    // Create new credential with division-OU pair
    const newCredential = new Credential({
      title,
      username,
      password,
      division,
      ou
    });

    await newCredential.save();
    return res.json({ success: true, message: 'Credential added successfully' });

  } catch (err) {
    console.error('Error saving credential:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update credential (Admin only)
exports.updateCredential = async (req, res) => {
  const { title, username, password, division, ou } = req.body;

  try {
    const credential = await Credential.findById(req.params.id);
    if (!credential) {
      return res.status(404).json({ message: 'Credential not found' });
    }

    // Update credential with new division-OU pair
    credential.title = title;
    credential.username = username;
    credential.password = password;
    credential.division = division;
    credential.ou = ou;

    await credential.save();
    return res.status(200).json({ success: true, credential });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};
