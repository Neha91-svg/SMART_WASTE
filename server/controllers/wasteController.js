const WasteReport = require('../models/WasteReport');

/**
 * Controller for waste report operations
 */
const wasteController = {
  // POST /report-waste — Create a new waste report
  createReport: async (req, res) => {
    try {
      const { location, address, wasteLevel, wasteType } = req.body;
      if (!location || !location.lat || !location.lng || !wasteLevel || !wasteType) {
        return res.status(400).json({ error: 'Missing required fields: location(lat, lng), wasteLevel, wasteType' });
      }
      const report = new WasteReport({ location, address, wasteLevel, wasteType });
      await report.save();
      res.status(201).json({ message: 'Waste report created successfully', data: report });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create waste report', details: error.message });
    }
  },

  // GET /waste-data — Get all waste reports
  getAllReports: async (req, res) => {
    try {
      const reports = await WasteReport.find().sort({ timestamp: -1 });
      res.json({ data: reports, count: reports.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch waste reports', details: error.message });
    }
  },

  // PATCH /waste-data/:id — Update waste report status
  updateReport: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const report = await WasteReport.findByIdAndUpdate(id, { status }, { new: true });
      if (!report) return res.status(404).json({ error: 'Report not found' });
      res.json({ message: 'Report updated', data: report });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update report', details: error.message });
    }
  },

  // GET /waste-stats — Get aggregated waste statistics
  getStats: async (req, res) => {
    try {
      const total = await WasteReport.countDocuments();
      const pending = await WasteReport.countDocuments({ status: 'Pending' });
      const inProgress = await WasteReport.countDocuments({ status: 'In Progress' });
      const collected = await WasteReport.countDocuments({ status: 'Collected' });
      const highPriority = await WasteReport.countDocuments({ wasteLevel: 'High' });
      const eWasteCount = await WasteReport.countDocuments({ wasteType: 'E-waste' });

      res.json({
        total,
        pending,
        inProgress,
        collected,
        highPriority,
        eWasteCount,
        collectionRate: total > 0 ? Math.round((collected / total) * 100) : 0
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats', details: error.message });
    }
  }
};

module.exports = wasteController;
