const EWasteCenter = require('../models/EWasteCenter');

/**
 * Controller for e-waste center operations
 */
const ewasteController = {
  // GET /ewaste-centers — Get all e-waste centers, optionally sorted by distance
  getCenters: async (req, res) => {
    try {
      const { lat, lng } = req.query;
      let centers = await EWasteCenter.find();

      // If user coordinates are provided, calculate distance and sort
      if (lat && lng) {
        const userLat = parseFloat(lat);
        const userLng = parseFloat(lng);

        centers = centers.map(center => {
          const distance = haversineDistance(
            userLat, userLng,
            center.location.lat, center.location.lng
          );
          return { ...center.toObject(), distance: Math.round(distance * 100) / 100 };
        }).sort((a, b) => a.distance - b.distance);
      }

      res.json({ data: centers, count: centers.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch e-waste centers', details: error.message });
    }
  },

  // GET /ewaste-centers/:id — Get single e-waste center
  getCenter: async (req, res) => {
    try {
      const center = await EWasteCenter.findById(req.params.id);
      if (!center) return res.status(404).json({ error: 'Center not found' });
      res.json({ data: center });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch center', details: error.message });
    }
  }
};

/**
 * Calculate distance between two coordinates using Haversine formula (in km)
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

module.exports = ewasteController;
