const express = require('express');
const router = express.Router();
const wasteController = require('../controllers/wasteController');

// POST /api/report-waste — Submit a new waste report
router.post('/report-waste', wasteController.createReport);

// GET /api/waste-data — Get all waste reports
router.get('/waste-data', wasteController.getAllReports);

// GET /api/waste-stats — Get waste statistics
router.get('/waste-stats', wasteController.getStats);

// PATCH /api/waste-data/:id — Update report status
router.patch('/waste-data/:id', wasteController.updateReport);

module.exports = router;
