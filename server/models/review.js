var mongoose = require('mongoose');
var reviewModel = require('./review');
var _ = require('lodash');

var reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    // update enum regex.
    validate: {
      validator: function(value) {
        return _.contains([1, 2, 3, 4, 5], value);
      },
      message: "Accepted value for rating is [1, 2, 3, 4, 5]."
    },
    required: true
  },
   buyer_review: {
     type: String,
     required: false
   },
   gallery: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'gallery',
     required: false
   },
   seller_response: {
     type: String,
     required: false
   },
   order: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Order',
     required: true
   },
   item: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Item',
     required: true
   },
   _uid: {
     type: String,
     required: true
   },
   _sid: {
     type: String,
     required: true
   }
 },
 {
   timestamps: true
 }
);

// Export the model.
var Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
