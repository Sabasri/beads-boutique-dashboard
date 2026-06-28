const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect); // All routes require authentication

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', authorize(['admin', 'staff']), createOrder);
router.put('/:id', authorize(['admin', 'staff']), updateOrderStatus);

module.exports = router;
