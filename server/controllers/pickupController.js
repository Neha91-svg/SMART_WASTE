const PickupRequest = require('../models/PickupRequest');

/**
 * Controller for pickup request operations
 */
const pickupController = {
  // POST /request-pickup — Create a new pickup request
  createRequest: async (req, res) => {
    try {
      const { address, location, preferredTime, wasteType } = req.body;
      if (!address || !location || !preferredTime) {
        return res.status(400).json({ error: 'Missing required fields: address, location, preferredTime' });
      }
      const request = new PickupRequest({ address, location, preferredTime, wasteType });
      await request.save();
      res.status(201).json({ message: 'Pickup request created successfully', data: request });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create pickup request', details: error.message });
    }
  },

  // GET /pickup-requests — Get all pickup requests
  getAllRequests: async (req, res) => {
    try {
      const requests = await PickupRequest.find().sort({ timestamp: -1 });
      res.json({ data: requests, count: requests.length });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch pickup requests', details: error.message });
    }
  },

  // PATCH /pickup-requests/:id — Update pickup request status
  updateRequest: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const request = await PickupRequest.findByIdAndUpdate(id, { status }, { new: true });
      if (!request) return res.status(404).json({ error: 'Request not found' });
      res.json({ message: 'Request updated', data: request });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update request', details: error.message });
    }
  }
};

module.exports = pickupController;
