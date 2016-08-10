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
  pick_up_date: {
    type: Date,
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
  update_date: {
    type: Date
  },
  create_date: {
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

  // change the update_date field to current date
  this.update_date = currentDate;

  // if create_date doesn't exist, add to that field
  if (!this.create_date)
    this.create_date = currentDate;

  next();
});

// Export the model.
var Order = mongoose.model('Order', orderSchema);
module.exports = Order;
