/**
 * CRM Routes — Admin-only endpoints for Customer & Vendor management
 */

const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crmController');

// Customer routes
router.get('/crm/customers', crmController.getCustomers);
router.get('/crm/customers/:id', crmController.getCustomerById);
router.patch('/crm/customers/:id', crmController.updateCustomer);

// Vendor routes
router.get('/crm/vendors', crmController.getVendors);
router.get('/crm/vendors/:id', crmController.getVendorById);
router.patch('/crm/vendors/:id', crmController.updateVendor);

// Stats
router.get('/crm/stats', crmController.getStats);

module.exports = router;
