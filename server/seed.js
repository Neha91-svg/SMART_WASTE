/**
 * Seed Script — Populates MongoDB with sample data for Mumbai
 * 
 * Creates:
 * - 15 waste locations across Mumbai
 * - 5 e-waste disposal centers
 * - 3 sample pickup requests
 * - 8 CRM customers (businesses/societies)
 * - 5 CRM vendors (waste collection companies)
 */

const mongoose = require('mongoose');
const WasteReport = require('./models/WasteReport');
const PickupRequest = require('./models/PickupRequest');
const EWasteCenter = require('./models/EWasteCenter');
const Customer = require('./models/Customer');
const Vendor = require('./models/Vendor');

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

// ============================================================
// CRM SEED DATA
// ============================================================

// 8 Customers — Businesses & Societies across Mumbai
const customers = [
  {
    name: 'Greenville Tech Park',
    type: 'Business',
    contactPerson: 'Rajesh Mehta',
    email: 'rajesh@greenvilletech.com',
    phone: '+91 98765 11111',
    address: 'Greenville IT Park, MIDC, Andheri East',
    location: { lat: 19.1136, lng: 72.8697 },
    city: 'Mumbai',
    status: 'Active',
    joinDate: new Date('2025-06-15'),
    plan: 'Enterprise',
    totalOrders: 24,
    totalSpent: 186000,
    lastOrderDate: new Date('2026-03-20'),
    orders: [
      { orderId: 'ORD-1001', date: new Date('2026-03-20'), wasteType: 'Mixed', weight: 850, amount: 12500, vendorAssigned: 'Eco Movers Logistics', status: 'Completed' },
      { orderId: 'ORD-0992', date: new Date('2026-03-05'), wasteType: 'E-waste', weight: 120, amount: 8500, vendorAssigned: 'GreenHaul Services', status: 'Completed' },
      { orderId: 'ORD-0978', date: new Date('2026-02-18'), wasteType: 'General', weight: 600, amount: 7200, vendorAssigned: 'Eco Movers Logistics', status: 'Completed' },
      { orderId: 'ORD-0961', date: new Date('2026-02-02'), wasteType: 'Mixed', weight: 740, amount: 9800, vendorAssigned: 'CleanCity Haulers', status: 'Completed' },
      { orderId: 'ORD-0945', date: new Date('2026-01-15'), wasteType: 'E-waste', weight: 200, amount: 15000, vendorAssigned: 'TechWaste Solutions', status: 'Completed' },
    ],
    transactions: [
      { date: new Date('2026-03-22'), type: 'Payment', amount: 12500, description: 'Invoice #INV-1001 — March bulk pickup', status: 'Completed' },
      { date: new Date('2026-03-07'), type: 'Payment', amount: 8500, description: 'Invoice #INV-0992 — E-waste disposal', status: 'Completed' },
      { date: new Date('2026-02-20'), type: 'Payment', amount: 7200, description: 'Invoice #INV-0978 — General waste', status: 'Completed' },
      { date: new Date('2026-02-04'), type: 'Payment', amount: 9800, description: 'Invoice #INV-0961 — Mixed disposal', status: 'Completed' },
      { date: new Date('2026-01-18'), type: 'Payment', amount: 15000, description: 'Invoice #INV-0945 — E-waste batch', status: 'Completed' },
    ],
    notes: 'Premium enterprise client. Monthly contract for bulk pickups. Very responsive.'
  },
  {
    name: 'Sunshine Co-op Society',
    type: 'Society',
    contactPerson: 'Priya Sharma',
    email: 'priya.sunshine@gmail.com',
    phone: '+91 98765 22222',
    address: '14A Sunshine Apartments, Bandra West',
    location: { lat: 19.0596, lng: 72.8295 },
    city: 'Mumbai',
    status: 'Active',
    joinDate: new Date('2025-09-01'),
    plan: 'Premium',
    totalOrders: 12,
    totalSpent: 42000,
    lastOrderDate: new Date('2026-03-18'),
    orders: [
      { orderId: 'ORD-1003', date: new Date('2026-03-18'), wasteType: 'General', weight: 300, amount: 3600, vendorAssigned: 'CleanCity Haulers', status: 'Scheduled' },
      { orderId: 'ORD-0985', date: new Date('2026-02-25'), wasteType: 'General', weight: 280, amount: 3200, vendorAssigned: 'Eco Movers Logistics', status: 'Completed' },
      { orderId: 'ORD-0970', date: new Date('2026-02-10'), wasteType: 'Mixed', weight: 350, amount: 4100, vendorAssigned: 'CleanCity Haulers', status: 'Completed' },
    ],
    transactions: [
      { date: new Date('2026-03-18'), type: 'Payment', amount: 3600, description: 'March biweekly pickup', status: 'Pending' },
      { date: new Date('2026-02-27'), type: 'Payment', amount: 3200, description: 'Feb second pickup', status: 'Completed' },
      { date: new Date('2026-02-12'), type: 'Payment', amount: 4100, description: 'Feb first pickup', status: 'Completed' },
    ],
    notes: 'Biweekly pickup schedule. Society of 120 flats. Contact Priya for gate access.'
  },
  {
    name: 'Horizon BPO Services',
    type: 'Business',
    contactPerson: 'Aditya Kulkarni',
    email: 'aditya.k@horizonbpo.in',
    phone: '+91 98765 33333',
    address: '9th Floor, Peninsula Tower, Lower Parel',
    location: { lat: 19.0002, lng: 72.8215 },
    city: 'Mumbai',
    status: 'Active',
    joinDate: new Date('2025-11-20'),
    plan: 'Premium',
    totalOrders: 8,
    totalSpent: 64000,
    lastOrderDate: new Date('2026-03-12'),
    orders: [
      { orderId: 'ORD-0998', date: new Date('2026-03-12'), wasteType: 'E-waste', weight: 180, amount: 14200, vendorAssigned: 'TechWaste Solutions', status: 'Completed' },
      { orderId: 'ORD-0980', date: new Date('2026-02-20'), wasteType: 'General', weight: 400, amount: 5500, vendorAssigned: 'Eco Movers Logistics', status: 'Completed' },
      { orderId: 'ORD-0955', date: new Date('2026-01-22'), wasteType: 'E-waste', weight: 250, amount: 18000, vendorAssigned: 'TechWaste Solutions', status: 'Completed' },
    ],
    transactions: [
      { date: new Date('2026-03-14'), type: 'Payment', amount: 14200, description: 'E-waste Q1 batch disposal', status: 'Completed' },
      { date: new Date('2026-02-22'), type: 'Payment', amount: 5500, description: 'Feb general waste', status: 'Completed' },
    ],
    notes: 'Large e-waste generator. Quarterly server decommission cycles.'
  },
  {
    name: 'Orchid Gardens Society',
    type: 'Society',
    contactPerson: 'Neha Desai',
    email: 'neha.orchid@gmail.com',
    phone: '+91 98765 44444',
    address: '22 Orchid Gardens, Powai',
    location: { lat: 19.1253, lng: 72.9069 },
    city: 'Mumbai',
    status: 'Active',
    joinDate: new Date('2025-08-10'),
    plan: 'Basic',
    totalOrders: 6,
    totalSpent: 18600,
    lastOrderDate: new Date('2026-02-28'),
    orders: [
      { orderId: 'ORD-0988', date: new Date('2026-02-28'), wasteType: 'General', weight: 220, amount: 2800, vendorAssigned: 'Urban Waste Co', status: 'Completed' },
      { orderId: 'ORD-0962', date: new Date('2026-01-30'), wasteType: 'Mixed', weight: 280, amount: 3500, vendorAssigned: 'Urban Waste Co', status: 'Completed' },
    ],
    transactions: [
      { date: new Date('2026-03-02'), type: 'Payment', amount: 2800, description: 'Feb pickup', status: 'Completed' },
      { date: new Date('2026-02-02'), type: 'Payment', amount: 3500, description: 'Jan pickup', status: 'Completed' },
    ],
    notes: 'Small society, 45 flats. Monthly pickup only.'
  },
  {
    name: 'MegaMart Retail Pvt Ltd',
    type: 'Business',
    contactPerson: 'Vikram Sinha',
    email: 'vikram@megamart.co.in',
    phone: '+91 98765 55555',
    address: '3rd Floor, Oberoi Mall, Goregaon East',
    location: { lat: 19.1550, lng: 72.8494 },
    city: 'Mumbai',
    status: 'Active',
    joinDate: new Date('2025-04-12'),
    plan: 'Enterprise',
    totalOrders: 32,
    totalSpent: 245000,
    lastOrderDate: new Date('2026-03-25'),
    orders: [
      { orderId: 'ORD-1010', date: new Date('2026-03-25'), wasteType: 'General', weight: 1200, amount: 14800, vendorAssigned: 'Eco Movers Logistics', status: 'Pending' },
      { orderId: 'ORD-1005', date: new Date('2026-03-15'), wasteType: 'Mixed', weight: 900, amount: 11200, vendorAssigned: 'CleanCity Haulers', status: 'Completed' },
      { orderId: 'ORD-0996', date: new Date('2026-03-02'), wasteType: 'General', weight: 1100, amount: 13500, vendorAssigned: 'Eco Movers Logistics', status: 'Completed' },
      { orderId: 'ORD-0983', date: new Date('2026-02-16'), wasteType: 'E-waste', weight: 80, amount: 6200, vendorAssigned: 'TechWaste Solutions', status: 'Completed' },
    ],
    transactions: [
      { date: new Date('2026-03-25'), type: 'Payment', amount: 14800, description: 'Weekly bulk — pending completion', status: 'Pending' },
      { date: new Date('2026-03-17'), type: 'Payment', amount: 11200, description: 'Mid-March haul', status: 'Completed' },
      { date: new Date('2026-03-05'), type: 'Payment', amount: 13500, description: 'Early March collection', status: 'Completed' },
      { date: new Date('2026-02-18'), type: 'Payment', amount: 6200, description: 'E-waste batch', status: 'Completed' },
    ],
    notes: 'Largest retail client. Weekly pickups, high volume. Priority handling required.'
  },
  {
    name: 'Pearl Heights CHS',
    type: 'Society',
    contactPerson: 'Suresh Patil',
    email: 'suresh.pearl@yahoo.com',
    phone: '+91 98765 66666',
    address: '88 Pearl Heights, Dadar West',
    location: { lat: 19.0178, lng: 72.8478 },
    city: 'Mumbai',
    status: 'Inactive',
    joinDate: new Date('2025-07-22'),
    plan: 'Basic',
    totalOrders: 4,
    totalSpent: 9800,
    lastOrderDate: new Date('2025-12-15'),
    orders: [
      { orderId: 'ORD-0910', date: new Date('2025-12-15'), wasteType: 'General', weight: 200, amount: 2600, vendorAssigned: 'Urban Waste Co', status: 'Completed' },
      { orderId: 'ORD-0880', date: new Date('2025-11-10'), wasteType: 'General', weight: 180, amount: 2400, vendorAssigned: 'Urban Waste Co', status: 'Completed' },
    ],
    transactions: [
      { date: new Date('2025-12-18'), type: 'Payment', amount: 2600, description: 'Dec pickup', status: 'Completed' },
      { date: new Date('2025-11-13'), type: 'Payment', amount: 2400, description: 'Nov pickup', status: 'Completed' },
    ],
    notes: 'Subscription lapsed in Dec 2025. Attempted re-engagement in Jan — no response.'
  },
  {
    name: 'TechNova Solutions',
    type: 'Business',
    contactPerson: 'Karan Thakkar',
    email: 'karan@technova.io',
    phone: '+91 98765 77777',
    address: '501 Hiranandani Estate, Thane West',
    location: { lat: 19.2183, lng: 72.9781 },
    city: 'Thane',
    status: 'Active',
    joinDate: new Date('2026-01-05'),
    plan: 'Premium',
    totalOrders: 5,
    totalSpent: 52000,
    lastOrderDate: new Date('2026-03-22'),
    orders: [
      { orderId: 'ORD-1008', date: new Date('2026-03-22'), wasteType: 'E-waste', weight: 300, amount: 22000, vendorAssigned: 'GreenHaul Services', status: 'Scheduled' },
      { orderId: 'ORD-0990', date: new Date('2026-02-28'), wasteType: 'E-waste', weight: 150, amount: 12000, vendorAssigned: 'TechWaste Solutions', status: 'Completed' },
      { orderId: 'ORD-0972', date: new Date('2026-02-05'), wasteType: 'General', weight: 380, amount: 4800, vendorAssigned: 'Eco Movers Logistics', status: 'Completed' },
    ],
    transactions: [
      { date: new Date('2026-03-22'), type: 'Payment', amount: 22000, description: 'Q1 e-waste decommission', status: 'Pending' },
      { date: new Date('2026-03-02'), type: 'Payment', amount: 12000, description: 'Feb e-waste batch', status: 'Completed' },
      { date: new Date('2026-02-07'), type: 'Payment', amount: 4800, description: 'Office general waste', status: 'Completed' },
    ],
    notes: 'New IT client. High e-waste volume — quarterly decommissions.'
  },
  {
    name: 'Azure Bay Society',
    type: 'Society',
    contactPerson: 'Meena Joshi',
    email: 'meena.azure@gmail.com',
    phone: '+91 98765 88888',
    address: '5 Azure Bay Complex, Worli Sea Face',
    location: { lat: 19.0002, lng: 72.8155 },
    city: 'Mumbai',
    status: 'Active',
    joinDate: new Date('2025-10-18'),
    plan: 'Premium',
    totalOrders: 10,
    totalSpent: 38500,
    lastOrderDate: new Date('2026-03-15'),
    orders: [
      { orderId: 'ORD-1006', date: new Date('2026-03-15'), wasteType: 'Mixed', weight: 420, amount: 5200, vendorAssigned: 'CleanCity Haulers', status: 'Completed' },
      { orderId: 'ORD-0991', date: new Date('2026-02-26'), wasteType: 'General', weight: 350, amount: 4000, vendorAssigned: 'Eco Movers Logistics', status: 'Completed' },
      { orderId: 'ORD-0975', date: new Date('2026-02-08'), wasteType: 'General', weight: 310, amount: 3800, vendorAssigned: 'Urban Waste Co', status: 'Completed' },
    ],
    transactions: [
      { date: new Date('2026-03-17'), type: 'Payment', amount: 5200, description: 'March pickup', status: 'Completed' },
      { date: new Date('2026-02-28'), type: 'Payment', amount: 4000, description: 'Feb second pickup', status: 'Completed' },
      { date: new Date('2026-02-10'), type: 'Payment', amount: 3800, description: 'Feb first pickup', status: 'Completed' },
    ],
    notes: 'Luxury society, 200+ flats. Biweekly schedule. Very particular about timing.'
  }
];

// 5 CRM Vendors — Waste collection companies
const crmVendors = [
  {
    name: 'Eco Movers Logistics',
    contactPerson: 'Arjun Deshmukh',
    email: 'arjun@ecomovers.in',
    phone: '+91 99876 11111',
    address: 'Plot 22, Turbhe MIDC, Navi Mumbai',
    location: { lat: 19.0728, lng: 72.9990 },
    city: 'Navi Mumbai',
    serviceArea: ['Andheri', 'Bandra', 'Goregaon', 'Powai', 'Lower Parel'],
    status: 'Active',
    joinDate: new Date('2025-03-10'),
    rating: 4.8,
    fleetSize: 12,
    specializations: ['General', 'Bulk', 'Mixed'],
    totalJobsCompleted: 156,
    totalEarnings: 824000,
    lastJobDate: new Date('2026-03-25'),
    jobs: [
      { jobId: 'JOB-5001', date: new Date('2026-03-25'), clientName: 'MegaMart Retail', wasteType: 'General', weight: 1200, amountEarned: 14800, status: 'In Progress' },
      { jobId: 'JOB-4998', date: new Date('2026-03-20'), clientName: 'Greenville Tech Park', wasteType: 'Mixed', weight: 850, amountEarned: 12500, status: 'Completed' },
      { jobId: 'JOB-4990', date: new Date('2026-03-02'), clientName: 'MegaMart Retail', wasteType: 'General', weight: 1100, amountEarned: 13500, status: 'Completed' },
      { jobId: 'JOB-4982', date: new Date('2026-02-25'), clientName: 'Sunshine Co-op', wasteType: 'General', weight: 280, amountEarned: 3200, status: 'Completed' },
      { jobId: 'JOB-4975', date: new Date('2026-02-20'), clientName: 'Horizon BPO', wasteType: 'General', weight: 400, amountEarned: 5500, status: 'Completed' },
    ],
    transactions: [
      { date: new Date('2026-03-21'), type: 'Payout', amount: 42000, description: 'March 1-20 batch payout', status: 'Completed' },
      { date: new Date('2026-03-01'), type: 'Payout', amount: 38500, description: 'February payout', status: 'Completed' },
      { date: new Date('2026-03-05'), type: 'Bonus', amount: 5000, description: 'Top performer bonus — Feb', status: 'Completed' },
    ],
    notes: 'Top performing vendor. Reliable fleet, always on time. Consider for premium contracts.'
  },
  {
    name: 'CleanCity Haulers',
    contactPerson: 'Sneha Rao',
    email: 'sneha@cleancity.co.in',
    phone: '+91 99876 22222',
    address: '14 Industrial Estate, Mulund East',
    location: { lat: 19.1726, lng: 72.9560 },
    city: 'Mumbai',
    serviceArea: ['Mulund', 'Thane', 'Bhandup', 'Dadar', 'Worli'],
    status: 'Active',
    joinDate: new Date('2025-05-18'),
    rating: 4.5,
    fleetSize: 8,
    specializations: ['General', 'Bulk', 'Hazardous'],
    totalJobsCompleted: 98,
    totalEarnings: 512000,
    lastJobDate: new Date('2026-03-18'),
    jobs: [
      { jobId: 'JOB-5003', date: new Date('2026-03-18'), clientName: 'Sunshine Co-op', wasteType: 'General', weight: 300, amountEarned: 3600, status: 'In Progress' },
      { jobId: 'JOB-4995', date: new Date('2026-03-15'), clientName: 'MegaMart Retail', wasteType: 'Mixed', weight: 900, amountEarned: 11200, status: 'Completed' },
      { jobId: 'JOB-4988', date: new Date('2026-03-15'), clientName: 'Azure Bay Society', wasteType: 'Mixed', weight: 420, amountEarned: 5200, status: 'Completed' },
      { jobId: 'JOB-4972', date: new Date('2026-02-02'), clientName: 'Greenville Tech Park', wasteType: 'Mixed', weight: 740, amountEarned: 9800, status: 'Completed' },
    ],
    transactions: [
      { date: new Date('2026-03-18'), type: 'Payout', amount: 28000, description: 'March 1-15 payout', status: 'Completed' },
      { date: new Date('2026-03-01'), type: 'Payout', amount: 25000, description: 'February payout', status: 'Completed' },
    ],
    notes: 'Solid vendor. Handles hazardous waste — certified. Good for Thane area.'
  },
  {
    name: 'TechWaste Solutions',
    contactPerson: 'Amit Patil',
    email: 'amit@techwaste.in',
    phone: '+91 99876 33333',
    address: '7 Electronic City, SEEPZ, Andheri East',
    location: { lat: 19.1196, lng: 72.8689 },
    city: 'Mumbai',
    serviceArea: ['Andheri', 'Powai', 'Goregaon', 'Lower Parel', 'BKC'],
    status: 'Active',
    joinDate: new Date('2025-06-01'),
    rating: 4.9,
    fleetSize: 5,
    specializations: ['E-waste', 'Electronics', 'IT Equipment'],
    totalJobsCompleted: 72,
    totalEarnings: 680000,
    lastJobDate: new Date('2026-03-12'),
    jobs: [
      { jobId: 'JOB-4997', date: new Date('2026-03-12'), clientName: 'Horizon BPO', wasteType: 'E-waste', weight: 180, amountEarned: 14200, status: 'Completed' },
      { jobId: 'JOB-4985', date: new Date('2026-02-28'), clientName: 'TechNova Solutions', wasteType: 'E-waste', weight: 150, amountEarned: 12000, status: 'Completed' },
      { jobId: 'JOB-4970', date: new Date('2026-02-16'), clientName: 'MegaMart Retail', wasteType: 'E-waste', weight: 80, amountEarned: 6200, status: 'Completed' },
      { jobId: 'JOB-4960', date: new Date('2026-01-22'), clientName: 'Horizon BPO', wasteType: 'E-waste', weight: 250, amountEarned: 18000, status: 'Completed' },
      { jobId: 'JOB-4950', date: new Date('2026-01-15'), clientName: 'Greenville Tech Park', wasteType: 'E-waste', weight: 200, amountEarned: 15000, status: 'Completed' },
    ],
    transactions: [
      { date: new Date('2026-03-15'), type: 'Payout', amount: 32400, description: 'March payout — 2 e-waste jobs', status: 'Completed' },
      { date: new Date('2026-03-01'), type: 'Payout', amount: 24200, description: 'February payout', status: 'Completed' },
      { date: new Date('2026-02-01'), type: 'Payout', amount: 33000, description: 'January payout', status: 'Completed' },
    ],
    notes: 'Premium e-waste specialist. Certified CPCB handler. Highest rates but best quality.'
  },
  {
    name: 'GreenHaul Services',
    contactPerson: 'Rahul Jain',
    email: 'rahul@greenhaul.in',
    phone: '+91 99876 44444',
    address: '45 Saki Naka Industrial Area, Andheri East',
    location: { lat: 19.1075, lng: 72.8893 },
    city: 'Mumbai',
    serviceArea: ['Kurla', 'Sion', 'Thane', 'Andheri'],
    status: 'Active',
    joinDate: new Date('2025-08-14'),
    rating: 4.2,
    fleetSize: 6,
    specializations: ['General', 'E-waste', 'Bulk'],
    totalJobsCompleted: 45,
    totalEarnings: 285000,
    lastJobDate: new Date('2026-03-22'),
    jobs: [
      { jobId: 'JOB-5008', date: new Date('2026-03-22'), clientName: 'TechNova Solutions', wasteType: 'E-waste', weight: 300, amountEarned: 22000, status: 'In Progress' },
      { jobId: 'JOB-4993', date: new Date('2026-03-05'), clientName: 'Greenville Tech Park', wasteType: 'E-waste', weight: 120, amountEarned: 8500, status: 'Completed' },
    ],
    transactions: [
      { date: new Date('2026-03-08'), type: 'Payout', amount: 8500, description: 'Single job payout', status: 'Completed' },
      { date: new Date('2026-03-01'), type: 'Payout', amount: 15000, description: 'February payout', status: 'Completed' },
    ],
    notes: 'Mid-tier vendor. Growing fleet. Good for overflow work in East Mumbai.'
  },
  {
    name: 'Urban Waste Co',
    contactPerson: 'Pooja Nair',
    email: 'pooja@urbanwaste.com',
    phone: '+91 99876 55555',
    address: '88 Nariman Point, South Mumbai',
    location: { lat: 18.9250, lng: 72.8228 },
    city: 'Mumbai',
    serviceArea: ['South Mumbai', 'Worli', 'Dadar', 'Powai'],
    status: 'Inactive',
    joinDate: new Date('2025-04-30'),
    rating: 3.8,
    fleetSize: 4,
    specializations: ['General'],
    totalJobsCompleted: 34,
    totalEarnings: 142000,
    lastJobDate: new Date('2026-02-28'),
    jobs: [
      { jobId: 'JOB-4987', date: new Date('2026-02-28'), clientName: 'Orchid Gardens', wasteType: 'General', weight: 220, amountEarned: 2800, status: 'Completed' },
      { jobId: 'JOB-4965', date: new Date('2026-02-08'), clientName: 'Azure Bay Society', wasteType: 'General', weight: 310, amountEarned: 3800, status: 'Completed' },
      { jobId: 'JOB-4948', date: new Date('2026-01-30'), clientName: 'Orchid Gardens', wasteType: 'Mixed', weight: 280, amountEarned: 3500, status: 'Completed' },
    ],
    transactions: [
      { date: new Date('2026-03-05'), type: 'Payout', amount: 10100, description: 'February final payout', status: 'Completed' },
      { date: new Date('2026-03-01'), type: 'Deduction', amount: -2000, description: 'Late pickup penalty — 2 incidents', status: 'Completed' },
    ],
    notes: 'Underperforming — multiple late pickups in Feb. Set to inactive pending review.'
  }
];


/**
 * Seed the database with sample data
 */
async function seedDatabase() {
  try {
    // Check if database is already populated
    const count = await WasteReport.countDocuments();
    if (count > 0) {
      console.log('⚡ Persistent database detected. Skipping seed injection.');
      return;
    }

    // Clear existing data (just in case)
    await WasteReport.deleteMany({});
    await PickupRequest.deleteMany({});
    await EWasteCenter.deleteMany({});
    await Customer.deleteMany({});
    await Vendor.deleteMany({});

    // Insert sample data
    await WasteReport.insertMany(wasteReports);
    await PickupRequest.insertMany(pickupRequests);
    await EWasteCenter.insertMany(ewasteCenters);
    await Customer.insertMany(customers);
    await Vendor.insertMany(crmVendors);

    console.log('✅ Database seeded successfully!');
    console.log(`   📍 ${wasteReports.length} waste reports`);
    console.log(`   🚛 ${pickupRequests.length} pickup requests`);
    console.log(`   ♻️  ${ewasteCenters.length} e-waste centers`);
    console.log(`   🏢 ${customers.length} CRM customers`);
    console.log(`   🚚 ${crmVendors.length} CRM vendors`);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    throw error;
  }
}

module.exports = { seedDatabase };
