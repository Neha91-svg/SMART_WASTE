const WasteReport = require('../models/WasteReport');
const { optimizeRoute } = require('../utils/routeOptimizer');

/**
 * Controller for route optimization operations
 */
const routeController = {
  // POST /optimize-route — Optimize waste collection route
  optimize: async (req, res) => {
    try {
      const { truckStart, locations } = req.body;

      // Default truck start: Municipal Corporation Office, Mumbai
      const start = truckStart || { lat: 19.0760, lng: 72.8777 };

      let wasteLocations = locations;

      // If no locations provided, fetch from database (pending/high priority first)
      if (!wasteLocations || wasteLocations.length === 0) {
        const reports = await WasteReport.find({ status: { $ne: 'Collected' } });
        wasteLocations = reports.map(r => ({
          location: r.location,
          wasteLevel: r.wasteLevel,
          wasteType: r.wasteType,
          address: r.address || 'Waste Point',
          id: r._id
        }));
      }

      if (wasteLocations.length === 0) {
        return res.status(400).json({ error: 'No waste locations available for route optimization' });
      }

      const result = optimizeRoute(wasteLocations, start);

      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        message: 'Route optimized successfully',
        data: result
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to optimize route', details: error.message });
    }
  }
};

module.exports = routeController;
