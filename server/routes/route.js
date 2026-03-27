const express = require('express');
const router = express.Router();
const routeController = require('../controllers/routeController');

// POST /api/optimize-route — Optimize waste collection route
router.post('/optimize-route', routeController.optimize);

module.exports = router;
