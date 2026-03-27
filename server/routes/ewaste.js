const express = require('express');
const router = express.Router();
const ewasteController = require('../controllers/ewasteController');

// GET /api/ewaste-centers — Get all e-waste centers (optional: ?lat=&lng= for distance sort)
router.get('/ewaste-centers', ewasteController.getCenters);

// GET /api/ewaste-centers/:id — Get single e-waste center
router.get('/ewaste-centers/:id', ewasteController.getCenter);

module.exports = router;
