var mongoose = require('mongoose');
var orderModel = require('./order');

var orderSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item'
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
    enum: ['ordered', 'confirmed', 'ready', 'complete', 'canceled', 'declined'],
    required: true
  },
  _uid: {
    type: String,
    required: true
  },
  _sid: {
    type: String,
    required: true
  },
  complete_order_id: {
    type: String,
    require: true
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
