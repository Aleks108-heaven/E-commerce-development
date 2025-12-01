const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');
const { validate, orderRules, mongoIdRule } = require('../middleware/validation');
const { rateLimiters } = require('../middleware/rateLimit');

// All order routes require authentication
router.use(protect);

// Customer routes
router.post('/', rateLimiters.write, orderRules.create, validate, orderController.createOrder);
router.get('/', rateLimiters.general, orderController.getOrders);
router.get('/:id', rateLimiters.general, mongoIdRule('id'), validate, orderController.getOrder);
router.post('/:id/cancel', rateLimiters.write, mongoIdRule('id'), validate, orderController.cancelOrder);

// Admin routes
router.get('/admin/all', rateLimiters.general, authorize('admin'), orderController.getAllOrders);
router.patch('/:id/status', rateLimiters.write, authorize('admin'), mongoIdRule('id'), validate, orderController.updateOrderStatus);

module.exports = router;
