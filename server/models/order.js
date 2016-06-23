var mongoose = require('mongoose');

var OrderSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  orderDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true
  }
});

// Export the model.
module.exports = mongoose.model('order', OrderSchema);
