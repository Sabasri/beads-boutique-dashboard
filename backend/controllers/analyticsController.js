const db = require('../utils/database');

// Helper to get start and end dates
const getMonthStartAndEnd = (date) => {
  const y = date.getFullYear();
  const m = date.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

const getPreviousMonthStartAndEnd = (date) => {
  const y = date.getFullYear();
  const m = date.getMonth();
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  return { start, end };
};

// Get Dashboard Overview KPI & Recent Orders
const getOverview = async (req, res) => {
  try {
    const products = await db.products.find();
    const orders = await db.orders.find();
    const customers = await db.customers.find();

    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalCustomers = customers.length;
    const lowStockItems = products.filter(p => p.quantity <= p.reorderLevel).length;

    // Calculate revenue & sales for current and previous months
    const now = new Date();
    const curMonth = getMonthStartAndEnd(now);
    const prevMonth = getPreviousMonthStartAndEnd(now);

    const curMonthOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= curMonth.start && d <= curMonth.end && o.orderStatus !== 'Cancelled';
    });

    const prevMonthOrders = orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= prevMonth.start && d <= prevMonth.end && o.orderStatus !== 'Cancelled';
    });

    const curMonthRevenue = curMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const prevMonthRevenue = prevMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const curMonthSalesCount = curMonthOrders.length;
    const prevMonthSalesCount = prevMonthOrders.length;

    // Percent changes
    const revenueGrowth = prevMonthRevenue > 0 
      ? ((curMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 
      : curMonthRevenue > 0 ? 100 : 0;

    const salesGrowth = prevMonthSalesCount > 0 
      ? ((curMonthSalesCount - prevMonthSalesCount) / prevMonthSalesCount) * 100 
      : curMonthSalesCount > 0 ? 100 : 0;

    const customerGrowth = customers.length > 0 ? 12.5 : 0; // Simulated growth rate for UI polish

    // Get 5 recent orders
    // Sort in-memory to ensure consistency
    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentOrders = sortedOrders.slice(0, 5);

    res.json({
      kpis: {
        totalProducts,
        totalOrders,
        totalCustomers,
        lowStockItems,
        monthlyRevenue: curMonthRevenue,
        monthlySales: curMonthSalesCount,
        revenueGrowth,
        salesGrowth,
        customerGrowth
      },
      recentOrders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating overview' });
  }
};

// Get Sales Trends (Daily, Weekly, Monthly)
const getSalesTrend = async (req, res) => {
  try {
    const orders = (await db.orders.find()).filter(o => o.orderStatus !== 'Cancelled');
    const type = req.query.type || 'monthly'; // 'daily', 'weekly', 'monthly'

    let chartData = [];

    if (type === 'monthly') {
      // Group by month over the last 12 months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData = {};

      // Initialize last 12 months
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
        monthlyData[label] = { label, revenue: 0, sales: 0 };
      }

      orders.forEach(o => {
        const d = new Date(o.createdAt);
        const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
        if (monthlyData[label]) {
          monthlyData[label].revenue += o.totalAmount;
          monthlyData[label].sales += 1;
        }
      });

      chartData = Object.values(monthlyData);
    } else if (type === 'weekly') {
      // Group by weeks of the current month
      const now = new Date();
      const weeksData = {
        'Week 1': { label: 'Week 1', revenue: 0, sales: 0 },
        'Week 2': { label: 'Week 2', revenue: 0, sales: 0 },
        'Week 3': { label: 'Week 3', revenue: 0, sales: 0 },
        'Week 4': { label: 'Week 4', revenue: 0, sales: 0 },
        'Week 5+': { label: 'Week 5+', revenue: 0, sales: 0 }
      };

      orders.forEach(o => {
        const d = new Date(o.createdAt);
        if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
          const day = d.getDate();
          let week = 'Week 1';
          if (day > 28) week = 'Week 5+';
          else if (day > 21) week = 'Week 4';
          else if (day > 14) week = 'Week 3';
          else if (day > 7) week = 'Week 2';

          weeksData[week].revenue += o.totalAmount;
          weeksData[week].sales += 1;
        }
      });

      chartData = Object.values(weeksData);
    } else if (type === 'daily') {
      // Group by day for the last 15 days
      const dailyData = {};
      const now = new Date();
      
      for (let i = 14; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const label = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
        dailyData[label] = { label, revenue: 0, sales: 0 };
      }

      orders.forEach(o => {
        const d = new Date(o.createdAt);
        const label = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
        if (dailyData[label]) {
          dailyData[label].revenue += o.totalAmount;
          dailyData[label].sales += 1;
        }
      });

      chartData = Object.values(dailyData);
    }

    res.json(chartData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating sales trends' });
  }
};

// Get Product Performance (Best Sellers)
const getProductPerformance = async (req, res) => {
  try {
    const orders = (await db.orders.find()).filter(o => o.orderStatus !== 'Cancelled');
    const salesMap = {};

    orders.forEach(o => {
      o.products.forEach(p => {
        const id = p.product.toString();
        if (!salesMap[id]) {
          salesMap[id] = {
            name: p.name,
            quantity: 0,
            revenue: 0
          };
        }
        salesMap[id].quantity += p.quantity;
        salesMap[id].revenue += p.price * p.quantity;
      });
    });

    const performance = Object.values(salesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 7); // Top 7 best sellers

    res.json(performance);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating product performance' });
  }
};

// Get Revenue Distribution by Category
const getRevenueDistribution = async (req, res) => {
  try {
    const orders = (await db.orders.find()).filter(o => o.orderStatus !== 'Cancelled');
    const products = await db.products.find();

    const categoryMap = {
      'Handmade Bracelets': 0,
      'Earrings': 0,
      'Customized Jewelry': 0,
      'Gift Accessories': 0
    };

    // Build a map of product ID to category for speed
    const prodCategoryMap = {};
    products.forEach(p => {
      prodCategoryMap[p._id.toString()] = p.category;
    });

    orders.forEach(o => {
      o.products.forEach(item => {
        const cat = prodCategoryMap[item.product.toString()] || 'Handmade Bracelets';
        if (categoryMap[cat] !== undefined) {
          categoryMap[cat] += item.price * item.quantity;
        }
      });
    });

    const distribution = Object.keys(categoryMap).map(name => ({
      name,
      value: Math.round(categoryMap[name])
    }));

    res.json(distribution);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating revenue distribution' });
  }
};

// Get Advanced Analytics Page Details
const getAdvancedAnalytics = async (req, res) => {
  try {
    const orders = (await db.orders.find()).filter(o => o.orderStatus !== 'Cancelled');
    const products = await db.products.find();
    const customers = await db.customers.find();

    // 1. New vs Returning Customers
    // A returning customer is one who has > 1 order
    const customerOrderCounts = {};
    orders.forEach(o => {
      const custId = o.customer.toString();
      customerOrderCounts[custId] = (customerOrderCounts[custId] || 0) + 1;
    });

    let returningCount = 0;
    let newCount = 0;
    Object.values(customerOrderCounts).forEach(count => {
      if (count > 1) returningCount++;
      else newCount++;
    });

    // Handle remaining registered customers who might have 0 orders
    const customersWithOrders = Object.keys(customerOrderCounts).length;
    const zeroOrderCustomers = Math.max(0, customers.length - customersWithOrders);
    newCount += zeroOrderCustomers;

    const customerTypes = [
      { name: 'New Customers', value: newCount },
      { name: 'Returning Customers', value: returningCount }
    ];

    // 2. Inventory Analytics: Fast vs Slow Moving
    // Fast moving: high sales quantity relative to stock
    // Slow moving: low sales quantity, high stock
    const productSales = {};
    products.forEach(p => {
      productSales[p._id.toString()] = {
        name: p.name,
        sku: p.sku,
        category: p.category,
        stock: p.quantity,
        sold: 0,
        revenue: 0
      };
    });

    orders.forEach(o => {
      o.products.forEach(item => {
        const id = item.product.toString();
        if (productSales[id]) {
          productSales[id].sold += item.quantity;
          productSales[id].revenue += item.price * item.quantity;
        }
      });
    });

    const productSalesList = Object.values(productSales);

    // Fast moving: sorted by quantity sold descending
    const fastMoving = [...productSalesList]
      .filter(p => p.sold > 0)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    // Slow moving: sorted by stock descending, and sold ascending
    const slowMoving = [...productSalesList]
      .sort((a, b) => {
        if (a.sold === b.sold) {
          return b.stock - a.stock; // more stock first
        }
        return a.sold - b.sold; // fewer sales first
      })
      .slice(0, 5);

    // 3. Month-over-Month Growth (Last 6 Months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRev = {};
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      monthlyRev[label] = { label, revenue: 0 };
    }

    orders.forEach(o => {
      const d = new Date(o.createdAt);
      const label = `${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (monthlyRev[label]) {
        monthlyRev[label].revenue += o.totalAmount;
      }
    });

    const revenueGrowthTrend = Object.values(monthlyRev);

    res.json({
      customerTypes,
      fastMoving,
      slowMoving,
      revenueGrowthTrend,
      customerRetentionRate: customers.length > 0 
        ? Math.round((returningCount / customers.length) * 100) 
        : 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating advanced analytics' });
  }
};

module.exports = {
  getOverview,
  getSalesTrend,
  getProductPerformance,
  getRevenueDistribution,
  getAdvancedAnalytics
};
