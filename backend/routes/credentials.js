const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/verifyToken');

const credentialController = require('../controllers/credentialController');

// Get all credentials
router.get('/', verifyToken, credentialController.getAllCredentials);

// View credentials for a division
router.get('/:divisionId', verifyToken, credentialController.viewCredentials);

// Add new credentials
router.post('/', verifyToken, credentialController.addCredential);

// Update a credential
router.put('/:id', verifyToken, credentialController.updateCredential);


module.exports = router;
