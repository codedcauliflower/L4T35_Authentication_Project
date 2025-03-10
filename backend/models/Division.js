const mongoose = require('mongoose');

const DivisionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  ou: { type: String }
});

module.exports = mongoose.model('Division', DivisionSchema, 'Division');
