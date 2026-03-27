const mongoose = require('mongoose');

/**
 * WasteReport Schema
 * Stores waste reports submitted by users with location, level, and type
 */
const wasteReportSchema = new mongoose.Schema({
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  address: { type: String, default: '' },
  wasteLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    required: true
  },
  wasteType: {
    type: String,
    enum: ['General', 'E-waste'],
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Collected'],
    default: 'Pending'
  },
  reportedBy: { type: String, default: 'User' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WasteReport', wasteReportSchema);
