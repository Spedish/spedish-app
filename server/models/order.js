var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
  item_id: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    min: [0],
    required: true
  },
  unit_price: {
    type: Number,
    min: [0],
    required: true
  },
  total_price: {
    type: Number,
    min: [0],
    required: true
  },
  note: {
    type: String
  },
  updated_date: {
    type: Date
  },
  order_date: {
    type: Date
  },
  status: {
    type: String,
    enum: ['ordered', 'paid', 'ready for pickup', 'picked up'],
    required: true
  }
});

// on every save, add the date
orderSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_date = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.order_date)
    this.order_date = currentDate;

  next();
});

// Export the model.
var Order = mongoose.model('Order', orderSchema);
module.exports = Order;
