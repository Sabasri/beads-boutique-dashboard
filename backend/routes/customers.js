const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect); // All routes require authentication

router.get('/', getCustomers);
router.get('/:id', getCustomerById);
router.post('/', authorize(['admin', 'staff']), createCustomer);
router.put('/:id', authorize(['admin', 'staff']), updateCustomer);
router.delete('/:id', authorize('admin'), deleteCustomer);

module.exports = router;
