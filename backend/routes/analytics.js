const express = require('express');
const router = express.Router();
const {
  getOverview,
  getSalesTrend,
  getProductPerformance,
  getRevenueDistribution,
  getAdvancedAnalytics
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All routes require authentication

router.get('/overview', getOverview);
router.get('/sales-trend', getSalesTrend);
router.get('/product-performance', getProductPerformance);
router.get('/revenue-distribution', getRevenueDistribution);
router.get('/advanced', getAdvancedAnalytics);

module.exports = router;
