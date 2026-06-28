const db = require('../utils/database');

// Helper to create notifications
const createNotification = async (type, message) => {
  try {
    await db.notifications.create({ type, message, read: false });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};

// Get All Orders
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    // Filter by status
    if (req.query.status && req.query.status !== 'All') {
      filter.orderStatus = req.query.status;
    }

    // Filter by payment status
    if (req.query.paymentStatus) {
      filter.paymentStatus = req.query.paymentStatus;
    }

    // Search query (orderId or customer name)
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      filter.$or = [
        { orderId: searchRegex },
        { customerName: searchRegex }
      ];
    }

    const orders = await db.orders.find(filter, { skip, limit, sort: { createdAt: -1 } });
    const total = await db.orders.countDocuments(filter);

    res.json({
      orders,
      page,
      pages: Math.ceil(total / limit),
      totalOrders: total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

// Get Single Order
const getOrderById = async (req, res) => {
  try {
    const order = await db.orders.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};

// Create Order
const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items, // array of { productId, quantity }
      paymentStatus
    } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !items || !items.length) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // 1. Verify products exist and have sufficient stock
    const productsToUpdate = [];
    let totalAmount = 0;
    const orderItems = [];

    for (let item of items) {
      const product = await db.products.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for product '${product.name}'` });
      }

      totalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price
      });

      productsToUpdate.push({
        product,
        newQuantity: product.quantity - item.quantity
      });
    }

    // 2. Manage/Update Customer
    let customer = await db.customers.findOne({ email: customerEmail.toLowerCase() });
    if (!customer) {
      // Create new customer profile
      customer = await db.customers.create({
        name: customerName,
        email: customerEmail.toLowerCase(),
        phone: customerPhone,
        address: shippingAddress,
        totalPurchases: totalAmount,
        lastOrderDate: new Date()
      });
    } else {
      // Update existing customer profile
      const updatedPurchases = (customer.totalPurchases || 0) + totalAmount;
      customer = await db.customers.findByIdAndUpdate(customer._id, {
        totalPurchases: updatedPurchases,
        lastOrderDate: new Date(),
        name: customerName, // keep latest name
        phone: customerPhone,
        address: shippingAddress
      });
    }

    // 3. Generate Order ID
    const totalOrders = await db.orders.countDocuments();
    const orderId = `BBB-${1000 + totalOrders + 1}`;

    // 4. Create Order record
    const order = await db.orders.create({
      orderId,
      customer: customer._id,
      customerName,
      customerContact: customerPhone,
      shippingAddress,
      products: orderItems,
      totalAmount,
      paymentStatus: paymentStatus || 'Pending',
      orderStatus: 'Pending'
    });

    // 5. Deduct Product Stock & Trigger low stock alerts if necessary
    for (let update of productsToUpdate) {
      const prod = update.product;
      const newQty = update.newQuantity;
      
      const updatedProd = await db.products.findByIdAndUpdate(prod._id, { quantity: newQty });

      if (newQty === 0) {
        await createNotification('stock', `Critical Alert: Product '${prod.name}' (SKU: ${prod.sku}) is now Out of Stock.`);
      } else if (newQty <= prod.reorderLevel) {
        await createNotification('stock', `Stock Warning: Product '${prod.name}' (SKU: ${prod.sku}) is Low in Stock (${newQty} remaining).`);
      }
    }

    // 6. Trigger notifications
    await createNotification('order', `New Order ${orderId} received from ${customerName} for $${totalAmount.toFixed(2)}.`);

    // Revenue milestone check (e.g., alert on every $5,000 increment, or simple notification)
    const allOrders = await db.orders.find();
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    // If it crosses a $5k milestone
    const prevRevenue = totalRevenue - totalAmount;
    if (Math.floor(totalRevenue / 5000) > Math.floor(prevRevenue / 5000)) {
      const milestone = Math.floor(totalRevenue / 5000) * 5000;
      await createNotification('milestone', `Revenue Milestone Reached: Total sales have passed $${milestone}!`);
    }

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;

    const order = await db.orders.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const oldStatus = order.orderStatus;
    const newStatus = orderStatus || oldStatus;
    const newPaymentStatus = paymentStatus || order.paymentStatus;

    const updatedOrder = await db.orders.findByIdAndUpdate(req.params.id, {
      orderStatus: newStatus,
      paymentStatus: newPaymentStatus
    });

    // Handle Cancelled order - restore inventory stock
    if (newStatus === 'Cancelled' && oldStatus !== 'Cancelled') {
      for (let item of order.products) {
        const product = await db.products.findById(item.product);
        if (product) {
          const restoredQty = product.quantity + item.quantity;
          await db.products.findByIdAndUpdate(product._id, { quantity: restoredQty });
        }
      }
      await createNotification('order', `Order ${order.orderId} was Cancelled. Inventory stock has been restored.`);
    }

    // Trigger notification if order was completed (delivered)
    if (newStatus === 'Delivered' && oldStatus !== 'Delivered') {
      await createNotification('order', `Order ${order.orderId} has been successfully Delivered.`);
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating order' });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
};
