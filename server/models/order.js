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
    required: true
  },
  unit_price: {
    type: Number,
    required: true
  },
  total_price: {
    type: Number,
    required: true
  },
  updated_date: {
    type: Date
  },
  order_date: {
    type: Date
  },
  status: {
    type: String,
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
module.exports = mongoose.model('order', orderSchema);
