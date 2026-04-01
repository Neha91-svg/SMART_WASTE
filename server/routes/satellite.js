const express = require('express');
const router = express.Router();

/**
 * POST /api/satellite-predict
 *
 * Proxy that forwards satellite prediction requests to the Python ML service.
 * The Python service handles:
 *   1. Google Earth Engine → Sentinel-2 B4, B8, B11 bands
 *   2. NDVI/NDBI computation from real satellite data
 *   3. OpenStreetMap road/POI fetching
 *   4. Feature engineering + Random Forest prediction
 */

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

router.post('/satellite-predict', async (req, res) => {
  try {
    const { bbox, resolution, date_range_days, time_modifier } = req.body;

    if (!bbox || !Array.isArray(bbox) || bbox.length !== 4) {
      return res.status(400).json({
        error: 'Missing or invalid bbox. Must be [south_lat, west_lng, north_lat, east_lng]',
      });
    }

    // Forward to Python satellite engine
    const mlResponse = await fetch(`${ML_SERVICE_URL}/satellite-predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bbox, resolution, date_range_days, time_modifier }),
    });

    if (!mlResponse.ok) {
      const errData = await mlResponse.json().catch(() => ({ error: 'ML service error' }));
      return res.status(mlResponse.status).json(errData);
    }

    const result = await mlResponse.json();
    res.json(result);

  } catch (error) {
    console.error('Satellite prediction proxy error:', error.message);

    if (error.cause?.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'ML service is not running',
        hint: 'Start the Python ML server: cd ml_service && python app.py',
      });
    }

    res.status(500).json({ error: 'Failed to get satellite predictions', details: error.message });
  }
});

// GET /api/satellite-health — Check satellite engine status
router.get('/satellite-health', async (req, res) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/satellite-health`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.json({ service: 'disconnected', error: error.message });
  }
});

module.exports = router;
