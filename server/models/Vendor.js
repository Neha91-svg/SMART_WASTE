const mongoose = require('mongoose');

/**
 * Vendor Schema — Waste collection companies/operators
 * Tracks fleet info, performance metrics, job history, and earnings.
 */
const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  city: { type: String, default: 'Mumbai' },
  serviceArea: [{ type: String }], // e.g. ['Andheri', 'Bandra', 'Juhu']
  status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },
  joinDate: { type: Date, default: Date.now },
  rating: { type: Number, min: 0, max: 5, default: 4.0 },
  fleetSize: { type: Number, default: 1 },
  specializations: [{ type: String }], // e.g. ['General', 'E-waste', 'Bulk', 'Hazardous']
  // Aggregated performance
  totalJobsCompleted: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  lastJobDate: { type: Date },
  // Job history embedded
  jobs: [{
    jobId: String,
    date: { type: Date, default: Date.now },
    clientName: String,
    wasteType: String,
    weight: Number,
    amountEarned: Number,
    status: { type: String, enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], default: 'Completed' }
  }],
  // Earnings log
  transactions: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['Payout', 'Bonus', 'Deduction'], default: 'Payout' },
    amount: Number,
    description: String,
    status: { type: String, enum: ['Completed', 'Pending', 'Failed'], default: 'Completed' }
  }],
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Vendor', vendorSchema);
