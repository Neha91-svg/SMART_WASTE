const mongoose = require('mongoose');

/**
 * PickupRequest Schema
 * Stores pickup requests from users with address and preferred time
 */
const pickupRequestSchema = new mongoose.Schema({
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  preferredTime: { type: String, required: true },
  wasteType: {
    type: String,
    enum: ['General', 'E-waste', 'Mixed'],
    default: 'General'
  },
  status: {
    type: String,
    enum: ['Pending', 'Scheduled', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  requestedBy: { type: String, default: 'User' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PickupRequest', pickupRequestSchema);
