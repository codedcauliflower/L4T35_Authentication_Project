const mongoose = require('mongoose');

const CredentialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  ou: { type: String },
  division: { type: String }
});

module.exports = mongoose.model('Credential', CredentialSchema, 'Credential');
