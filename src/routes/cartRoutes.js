const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const { validate, cartRules, mongoIdRule } = require('../middleware/validation');
const { rateLimiters } = require('../middleware/rateLimit');

// All cart routes require authentication
router.use(protect);

router.get('/', rateLimiters.general, cartController.getCart);
router.post('/items', rateLimiters.write, cartRules.addItem, validate, cartController.addToCart);
router.put('/items/:productId', rateLimiters.write, cartRules.updateItem, validate, cartController.updateCartItem);
router.delete('/items/:productId', rateLimiters.write, mongoIdRule('productId'), validate, cartController.removeFromCart);
router.delete('/', rateLimiters.write, cartController.clearCart);

module.exports = router;
