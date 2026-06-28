const db = require('../utils/database');

// Get All Customers
const getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Search query (name, email, or phone)
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    // Sort by total purchases (default) or registration
    let sort = { totalPurchases: -1 };
    if (req.query.sort === 'newest') {
      sort = { createdAt: -1 };
    } else if (req.query.sort === 'name') {
      sort = { name: 1 };
    }

    const customers = await db.customers.find(filter, { skip, limit, sort });
    const total = await db.customers.countDocuments(filter);

    res.json({
      customers,
      page,
      pages: Math.ceil(total / limit),
      totalCustomers: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching customers' });
  }
};

// Get Single Customer Profile & Order History
const getCustomerById = async (req, res) => {
  try {
    const customer = await db.customers.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Fetch order history for this customer
    const orders = await db.orders.find({ customer: customer._id }, { sort: { createdAt: -1 } });

    res.json({
      customer,
      orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching customer details' });
  }
};

// Create Customer Profile Manually (Optional)
const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    if (!name || !email || !phone || !address) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const emailExists = await db.customers.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ message: 'Customer email already exists' });
    }

    const customer = await db.customers.create({
      name,
      email: email.toLowerCase(),
      phone,
      address,
      totalPurchases: 0,
      lastOrderDate: null
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating customer' });
  }
};

// Update Customer
const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const customer = await db.customers.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (email && email.toLowerCase() !== customer.email) {
      const emailExists = await db.customers.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: 'Customer email already exists' });
      }
    }

    const updatedCustomer = await db.customers.findByIdAndUpdate(req.params.id, {
      name: name || customer.name,
      email: email ? email.toLowerCase() : customer.email,
      phone: phone || customer.phone,
      address: address || customer.address
    });

    res.json(updatedCustomer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating customer' });
  }
};

// Delete Customer (Admin Only)
const deleteCustomer = async (req, res) => {
  try {
    const customer = await db.customers.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    await db.customers.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error deleting customer' });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
