const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect); // All routes require authentication

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authorize('admin'), createProduct);
router.put('/:id', authorize(['admin', 'staff']), updateProduct);
router.delete('/:id', authorize('admin'), deleteProduct);

module.exports = router;
