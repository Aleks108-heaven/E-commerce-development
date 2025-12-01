const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { validate, productRules, mongoIdRule } = require('../middleware/validation');
const { rateLimiters } = require('../middleware/rateLimit');

// Public routes with general rate limiting
router.get('/', rateLimiters.general, productController.getProducts);
router.get('/category/:category', rateLimiters.general, productController.getProductsByCategory);
router.get('/:id', rateLimiters.general, mongoIdRule('id'), validate, productController.getProduct);

// Admin only routes with write rate limiting
router.post('/', rateLimiters.write, protect, authorize('admin'), productRules.create, validate, productController.createProduct);
router.put('/:id', rateLimiters.write, protect, authorize('admin'), mongoIdRule('id'), productRules.update, validate, productController.updateProduct);
router.delete('/:id', rateLimiters.write, protect, authorize('admin'), mongoIdRule('id'), validate, productController.deleteProduct);
router.patch('/:id/stock', rateLimiters.write, protect, authorize('admin'), mongoIdRule('id'), validate, productController.updateStock);

module.exports = router;
