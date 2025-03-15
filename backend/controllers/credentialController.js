const Credential = require('../models/Credential');
const Division = require('../models/Division');
const User = require('../models/User');
const OU = require('../models/OU')


// Fetch all credentials (Admin only)
exports.getAllCredentials = async (req, res) => {
  try {
    const credentials = await Credential.find(); // Get all credentials

    // Fetch names for each credential by searching by division and ou names
    const credentialsWithNames = await Promise.all(
      credentials.map(async (credential) => {
        // Find division by name (not by ID)
        const division = await Division.findOne({ name: credential.division });
        // Find OU by name (not by ID)
        const ou = await OU.findOne({ name: credential.ou });

        // Add division and OU names to the credential object
        return {
          ...credential.toObject(),
          divisionName: division ? division.name : 'Unknown Division',
          ouName: ou ? ou.name : 'Unknown OU'
        };
      })
    );

    return res.json({ success: true, credentials: credentialsWithNames });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// View credentials for divisions/OUs the user belongs to
exports.viewCredentials = async (req, res) => {
  try {
    // Get the user ID from the frontend (via JWT or session)
    const userId = req.user.id;

    // Find the user and populate their divisions/OUs
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Mapping the division and ou names to ObjectIds
    const userDivisionsAndOUs = await Promise.all(user.divisionsAndOUs.map(async (pair) => {
      const division = await Division.findOne({ name: pair.division }); // Find division by name
      const ou = await OU.findOne({ name: pair.ou }); // Find ou by name

      if (!division || !ou) {
        throw new Error('Division or OU not found');
      }

      return { division: division._id, ou: ou._id }; // Return ObjectIds
    }));

    // Now query credentials using ObjectIds
    const credentials = await Credential.find({
      $or: userDivisionsAndOUs.map(pair => ({ division: pair.division, ou: pair.ou }))
    })
      .populate('division', 'name')  // Populate division name
      .populate('ou', 'name');       // Populate OU name

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

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Create new credential
    const newCredential = new Credential({ title, username, password, division, ou });
    await newCredential.save();

    return res.json({ success: true, message: 'Credential added successfully' });
  } catch (err) {
    console.error('Error adding credential:', err);
    res.status(500).json({ message: 'Server error' });
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
