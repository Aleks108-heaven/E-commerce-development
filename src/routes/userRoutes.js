const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { validate, userRules } = require('../middleware/validation');
const { rateLimiters } = require('../middleware/rateLimit');

// Public routes with auth rate limiting (stricter)
router.post('/register', rateLimiters.auth, userRules.register, validate, userController.register);
router.post('/login', rateLimiters.auth, userRules.login, validate, userController.login);

// Protected routes with general rate limiting
router.get('/profile', rateLimiters.general, protect, userController.getProfile);
router.put('/profile', rateLimiters.write, protect, userController.updateProfile);
router.put('/password', rateLimiters.auth, protect, userRules.changePassword, validate, userController.changePassword);
router.post('/addresses', rateLimiters.write, protect, userController.addAddress);
router.delete('/addresses/:addressId', rateLimiters.write, protect, userController.deleteAddress);

module.exports = router;
