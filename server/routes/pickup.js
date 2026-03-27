const express = require('express');
const router = express.Router();
const pickupController = require('../controllers/pickupController');

// POST /api/request-pickup — Submit a new pickup request
router.post('/request-pickup', pickupController.createRequest);

// GET /api/pickup-requests — Get all pickup requests
router.get('/pickup-requests', pickupController.getAllRequests);

// PATCH /api/pickup-requests/:id — Update pickup request status
router.patch('/pickup-requests/:id', pickupController.updateRequest);

module.exports = router;
