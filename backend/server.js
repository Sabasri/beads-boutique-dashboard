const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const customerRoutes = require('./routes/customers');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support larger image payloads if needed

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Beads & Bracelets Boutique API is running' });
});

// Start DB and Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to Database (MongoDB with JSON fallback)
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });

  // Handle server errors (e.g. port already in use)
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ ERROR: Port ${PORT} is already in use.`);
      console.error(`   Another server process is already running on port ${PORT}.`);
      console.error(`   To fix this, run the following command to free the port:`);
      console.error(`\n   Windows PowerShell:`);
      console.error(`   Get-NetTCPConnection -LocalPort ${PORT} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }\n`);
      process.exit(1);
    } else {
      console.error('Server error:', err.message);
      process.exit(1);
    }
  });
};

startServer();
