/**
 * CRM Controller — Admin-only CRUD for Customers & Vendors
 * Provides list, detail, stats, and update operations.
 */

const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');

// ============================================================
// CUSTOMERS
// ============================================================

/** List all customers with optional search & filter */
exports.getCustomers = async (req, res) => {
  try {
    const { search, status, plan } = req.query;
    const filter = {};
    
    if (status && status !== 'All') filter.status = status;
    if (plan && plan !== 'All') filter.plan = plan;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers', details: error.message });
  }
};

/** Get a single customer by ID (with full order/transaction history) */
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer', details: error.message });
  }
};

/** Update customer status/notes */
exports.updateCustomer = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const update = {};
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;

    const customer = await Customer.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update customer', details: error.message });
  }
};

// ============================================================
// VENDORS
// ============================================================

/** List all vendors with optional search & filter */
exports.getVendors = async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const vendors = await Vendor.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: vendors });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vendors', details: error.message });
  }
};

/** Get a single vendor by ID (with full job/transaction history) */
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vendor', details: error.message });
  }
};

/** Update vendor status/notes */
exports.updateVendor = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const update = {};
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;

    const vendor = await Vendor.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json({ success: true, data: vendor });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update vendor', details: error.message });
  }
};

// ============================================================
// AGGREGATED STATS
// ============================================================

/** Get CRM-wide KPI statistics */
exports.getStats = async (req, res) => {
  try {
    const [customers, vendors] = await Promise.all([
      Customer.find({}),
      Vendor.find({})
    ]);

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'Active').length;
    const totalVendors = vendors.length;
    const activeVendors = vendors.filter(v => v.status === 'Active').length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const totalPayouts = vendors.reduce((sum, v) => sum + (v.totalEarnings || 0), 0);
    const avgRating = vendors.length > 0
      ? (vendors.reduce((sum, v) => sum + (v.rating || 0), 0) / vendors.length).toFixed(1)
      : 0;

    // Top vendor by jobs completed
    const topVendor = vendors.reduce((prev, curr) =>
      (curr.totalJobsCompleted > (prev?.totalJobsCompleted || 0)) ? curr : prev, null
    );

    res.json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        totalVendors,
        activeVendors,
        totalRevenue,
        totalPayouts,
        avgRating: Number(avgRating),
        topVendor: topVendor ? { name: topVendor.name, jobs: topVendor.totalJobsCompleted } : null
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch CRM stats', details: error.message });
  }
};
