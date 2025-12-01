const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpfulVotes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Ensure one review per user per product
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Static method to calculate average rating
reviewSchema.statics.calculateAverageRating = async function(productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    const Product = mongoose.model('Product');
    if (result.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        averageRating: Math.round(result[0].averageRating * 10) / 10,
        numReviews: result[0].numReviews
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        averageRating: 0,
        numReviews: 0
      });
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

// Update product rating after save
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.product);
});

// Update product rating after delete
reviewSchema.post('deleteOne', { document: true, query: false }, function() {
  this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
