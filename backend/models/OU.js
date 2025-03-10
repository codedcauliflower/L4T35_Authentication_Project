const mongoose = require('mongoose');

const OrganizationalUnitSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('OU', OrganizationalUnitSchema, 'OU');
