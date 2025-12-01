const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validate, reviewRules, mongoIdRule } = require('../middleware/validation');
const { rateLimiters } = require('../middleware/rateLimit');

// Public routes
router.get('/product/:productId', rateLimiters.general, mongoIdRule('productId'), validate, reviewController.getProductReviews);

// Protected routes
router.post('/product/:productId', rateLimiters.write, protect, mongoIdRule('productId'), reviewRules.create, validate, reviewController.createReview);
router.put('/:id', rateLimiters.write, protect, mongoIdRule('id'), reviewRules.update, validate, reviewController.updateReview);
router.delete('/:id', rateLimiters.write, protect, mongoIdRule('id'), validate, reviewController.deleteReview);
router.post('/:id/helpful', rateLimiters.write, protect, mongoIdRule('id'), validate, reviewController.markHelpful);
router.get('/user', rateLimiters.general, protect, reviewController.getUserReviews);

module.exports = router;
