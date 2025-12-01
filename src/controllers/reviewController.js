const Review = require('../models/Review');
const Order = require('../models/Order');

// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const reviews = await Review.find({ product: productId })
      .sort(sort)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate('user', 'firstName lastName');

    const total = await Review.countDocuments({ product: productId });

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create review
exports.createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user.id,
      product: productId
    });

    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already reviewed this product' 
      });
    }

    // Check if user has purchased this product
    const hasPurchased = await Order.exists({
      user: req.user.id,
      'items.product': productId,
      orderStatus: 'delivered'
    });

    const review = await Review.create({
      user: req.user.id,
      product: productId,
      rating,
      title,
      comment,
      isVerifiedPurchase: !!hasPurchased
    });

    await review.populate('user', 'firstName lastName');

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { rating, title, comment } = req.body;

    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;

    await review.save();
    await review.populate('user', 'firstName lastName');

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    await review.deleteOne();

    res.status(200).json({ success: true, message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark review as helpful
exports.markHelpful = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpfulVotes: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's reviews
exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .sort('-createdAt')
      .populate('product', 'name images');

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
