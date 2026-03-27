const mongoose = require('mongoose');

/**
 * EWasteCenter Schema
 * Stores e-waste disposal center information with location and contact details
 */
const eWasteCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  contact: { type: String, default: '' },
  email: { type: String, default: '' },
  operatingHours: { type: String, default: '9:00 AM - 6:00 PM' },
  acceptedItems: [{ type: String }],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EWasteCenter', eWasteCenterSchema);
