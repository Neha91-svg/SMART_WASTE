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

const path = require('path');

// Import routes
const wasteRoutes = require('./routes/waste');
const pickupRoutes = require('./routes/pickup');
const ewasteRoutes = require('./routes/ewaste');
const routeRoutes = require('./routes/route');
const chatRoutes = require('./routes/chat');
const predictionRoutes = require('./routes/prediction');
const crmRoutes = require('./routes/crm');
const satelliteRoutes = require('./routes/satellite');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// MIDDLEWARE
// ============================================================
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  }
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
app.use('/api', satelliteRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Waste Collection API is running', timestamp: new Date() });
});

// Root route for Render health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    service: 'Smart Waste Backend',
    endpoints: '/api/health'
  });
});

// ============================================================
// PRODUCTION SETUP (Serve Frontend)
// ============================================================
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));
  
  // Any request that doesn't match an API route should serve index.html
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.resolve(distPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'API route not found' });
    }
  });
}

// ============================================================
// ERROR HANDLING
// ============================================================
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Handle 404 for development (or if production static file wasn't matched)
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
      console.log(`   GET  /api/crm/stats`);
      console.log(`   POST /api/satellite-predict`);
      console.log(`   GET  /api/satellite-health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
