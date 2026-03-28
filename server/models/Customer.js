const mongoose = require('mongoose');

/**
 * Customer Schema — Businesses & Societies using the platform
 * Tracks company info, contact details, plan, and aggregated order metrics.
 */
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Business', 'Society', 'Enterprise'], default: 'Business' },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  city: { type: String, default: 'Mumbai' },
  status: { type: String, enum: ['Active', 'Inactive', 'Suspended'], default: 'Active' },
  joinDate: { type: Date, default: Date.now },
  plan: { type: String, enum: ['Basic', 'Premium', 'Enterprise'], default: 'Basic' },
  // Aggregated metrics (updated periodically or on-demand)
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrderDate: { type: Date },
  // Order history embedded for quick CRM access
  orders: [{
    orderId: String,
    date: { type: Date, default: Date.now },
    wasteType: String,
    weight: Number, // kg
    amount: Number, // ₹
    vendorAssigned: String,
    status: { type: String, enum: ['Pending', 'Scheduled', 'Completed', 'Cancelled'], default: 'Pending' }
  }],
  // Transaction log
  transactions: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['Payment', 'Refund', 'Credit'], default: 'Payment' },
    amount: Number,
    description: String,
    status: { type: String, enum: ['Completed', 'Pending', 'Failed'], default: 'Completed' }
  }],
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
