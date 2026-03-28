/**
 * Smart Waste Collection & E-Waste Disposal — Express Server
 * 
 * Main entry point. Connects to MongoDB (in-memory), seeds data, and starts API server.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { seedDatabase } = require('./seed');

// Import routes
const wasteRoutes = require('./routes/waste');
const pickupRoutes = require('./routes/pickup');
const ewasteRoutes = require('./routes/ewaste');
const routeRoutes = require('./routes/route');
const chatRoutes = require('./routes/chat');
const predictionRoutes = require('./routes/prediction');
const crmRoutes = require('./routes/crm');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================================
// API ROUTES
// ============================================================
app.use('/api', wasteRoutes);
app.use('/api', pickupRoutes);
app.use('/api', ewasteRoutes);
app.use('/api', routeRoutes);
app.use('/api', chatRoutes);
app.use('/api', predictionRoutes);
app.use('/api', crmRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Waste Collection API is running', timestamp: new Date() });
});

// ============================================================
// ERROR HANDLING
// ============================================================
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ============================================================
// START SERVER
// ============================================================
async function startServer() {
  try {
    // Connect to MongoDB (in-memory)
    await connectDB();

    // Seed database with sample data
    await seedDatabase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 API endpoints:`);
      console.log(`   GET  /api/health`);
      console.log(`   POST /api/report-waste`);
      console.log(`   GET  /api/waste-data`);
      console.log(`   GET  /api/waste-stats`);
      console.log(`   POST /api/request-pickup`);
      console.log(`   GET  /api/pickup-requests`);
      console.log(`   GET  /api/ewaste-centers`);
      console.log(`   POST /api/optimize-route`);
      console.log(`   POST /api/predict-heatmap`);
      console.log(`   GET  /api/ml-health`);
      console.log(`   GET  /api/crm/customers`);
      console.log(`   GET  /api/crm/vendors`);
      console.log(`   GET  /api/crm/stats\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
