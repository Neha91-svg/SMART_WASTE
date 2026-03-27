/**
 * Seed Script — Populates MongoDB with sample data for Mumbai
 * 
 * Creates:
 * - 15 waste locations across Mumbai
 * - 5 e-waste disposal centers
 * - 3 sample pickup requests
 */

const mongoose = require('mongoose');
const WasteReport = require('./models/WasteReport');
const PickupRequest = require('./models/PickupRequest');
const EWasteCenter = require('./models/EWasteCenter');

// 15 Waste locations across Mumbai with varying levels
const wasteReports = [
  { location: { lat: 19.0596, lng: 72.8295 }, address: 'Bandra West, Mumbai', wasteLevel: 'High', wasteType: 'General', status: 'Pending' },
  { location: { lat: 19.1136, lng: 72.8697 }, address: 'Andheri East, Mumbai', wasteLevel: 'High', wasteType: 'General', status: 'Pending' },
  { location: { lat: 19.1075, lng: 72.8263 }, address: 'Juhu Beach, Mumbai', wasteLevel: 'Medium', wasteType: 'General', status: 'Pending' },
  { location: { lat: 19.0178, lng: 72.8478 }, address: 'Dadar Station, Mumbai', wasteLevel: 'High', wasteType: 'E-waste', status: 'Pending' },
  { location: { lat: 19.0002, lng: 72.8155 }, address: 'Worli Sea Face, Mumbai', wasteLevel: 'Medium', wasteType: 'General', status: 'In Progress' },
  { location: { lat: 19.0759, lng: 72.8776 }, address: 'CST Area, Mumbai', wasteLevel: 'High', wasteType: 'General', status: 'Pending' },
  { location: { lat: 19.0896, lng: 72.8656 }, address: 'Sion, Mumbai', wasteLevel: 'Low', wasteType: 'General', status: 'Collected' },
  { location: { lat: 19.1334, lng: 72.9133 }, address: 'Powai Lake, Mumbai', wasteLevel: 'Medium', wasteType: 'E-waste', status: 'Pending' },
  { location: { lat: 19.0544, lng: 72.8406 }, address: 'Mahim Beach, Mumbai', wasteLevel: 'High', wasteType: 'General', status: 'Pending' },
  { location: { lat: 19.1763, lng: 72.9486 }, address: 'Mulund West, Mumbai', wasteLevel: 'Low', wasteType: 'General', status: 'Pending' },
  { location: { lat: 19.2183, lng: 72.9781 }, address: 'Thane Station, Mumbai', wasteLevel: 'Medium', wasteType: 'General', status: 'In Progress' },
  { location: { lat: 19.0430, lng: 72.8200 }, address: 'Prabhadevi, Mumbai', wasteLevel: 'High', wasteType: 'E-waste', status: 'Pending' },
  { location: { lat: 19.1197, lng: 72.9052 }, address: 'Kurla West, Mumbai', wasteLevel: 'Medium', wasteType: 'General', status: 'Pending' },
  { location: { lat: 19.0657, lng: 72.8370 }, address: 'Bandra East, Mumbai', wasteLevel: 'Low', wasteType: 'General', status: 'Collected' },
  { location: { lat: 19.1550, lng: 72.8494 }, address: 'Goregaon East, Mumbai', wasteLevel: 'High', wasteType: 'General', status: 'Pending' }
];

// 5 E-waste disposal centers in Mumbai
const ewasteCenters = [
  {
    name: 'EcoGreen E-Waste Solutions',
    address: 'Plot 14, MIDC Industrial Area, Andheri East, Mumbai',
    location: { lat: 19.1196, lng: 72.8689 },
    contact: '+91 98765 43210',
    email: 'info@ecogreen.in',
    operatingHours: '9:00 AM - 6:00 PM',
    acceptedItems: ['Computers', 'Laptops', 'Phones', 'Printers', 'Batteries']
  },
  {
    name: 'Mumbai E-Waste Recyclers',
    address: '23 Kala Ghoda, Fort, Mumbai',
    location: { lat: 18.9388, lng: 72.8325 },
    contact: '+91 98765 12345',
    email: 'contact@mumbairec.com',
    operatingHours: '10:00 AM - 7:00 PM',
    acceptedItems: ['TVs', 'Monitors', 'Refrigerators', 'Washing Machines', 'ACs']
  },
  {
    name: 'TechCycle India Pvt Ltd',
    address: '56 Senapati Bapat Marg, Dadar West, Mumbai',
    location: { lat: 19.0245, lng: 72.8432 },
    contact: '+91 99887 65432',
    email: 'support@techcycle.in',
    operatingHours: '9:30 AM - 5:30 PM',
    acceptedItems: ['Phones', 'Tablets', 'Cables', 'Circuit Boards', 'Batteries']
  },
  {
    name: 'GreenTech Disposal Center',
    address: 'B-12, Saki Vihar Road, Powai, Mumbai',
    location: { lat: 19.1255, lng: 72.9070 },
    contact: '+91 98234 56789',
    email: 'hello@greentech.co.in',
    operatingHours: '8:00 AM - 8:00 PM',
    acceptedItems: ['All Electronics', 'Solar Panels', 'LED Bulbs', 'Wiring']
  },
  {
    name: 'CleanElectro Waste Services',
    address: '78 LBS Marg, Mulund West, Mumbai',
    location: { lat: 19.1726, lng: 72.9560 },
    contact: '+91 91234 78901',
    email: 'info@cleanelectro.in',
    operatingHours: '9:00 AM - 6:00 PM',
    acceptedItems: ['Computers', 'Servers', 'Networking Equipment', 'UPS Systems']
  }
];

// 3 Sample pickup requests
const pickupRequests = [
  {
    address: '15 Carter Road, Bandra West, Mumbai',
    location: { lat: 19.0620, lng: 72.8270 },
    preferredTime: '10:00 AM - 12:00 PM',
    wasteType: 'General',
    status: 'Pending'
  },
  {
    address: '42 Hill Road, Bandra West, Mumbai',
    location: { lat: 19.0545, lng: 72.8327 },
    preferredTime: '2:00 PM - 4:00 PM',
    wasteType: 'E-waste',
    status: 'Scheduled'
  },
  {
    address: '8 SV Road, Andheri West, Mumbai',
    location: { lat: 19.1187, lng: 72.8464 },
    preferredTime: '9:00 AM - 11:00 AM',
    wasteType: 'Mixed',
    status: 'Pending'
  }
];

/**
 * Seed the database with sample data
 */
async function seedDatabase() {
  try {
    // Clear existing data
    await WasteReport.deleteMany({});
    await PickupRequest.deleteMany({});
    await EWasteCenter.deleteMany({});

    // Insert sample data
    await WasteReport.insertMany(wasteReports);
    await PickupRequest.insertMany(pickupRequests);
    await EWasteCenter.insertMany(ewasteCenters);

    console.log('✅ Database seeded successfully!');
    console.log(`   📍 ${wasteReports.length} waste reports`);
    console.log(`   🚛 ${pickupRequests.length} pickup requests`);
    console.log(`   ♻️  ${ewasteCenters.length} e-waste centers`);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  }
}

module.exports = { seedDatabase };
