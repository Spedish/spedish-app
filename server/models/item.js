var mongoose = require('mongoose');

var orderSchema = new mongoose.Schema({
    item_id: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      min: [0],
      required: true
    },
    total_price: {
      type: Number,
      min: [0],
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
      enum: ['ordered', 'paid', 'ready for pickup', 'picked up'],
      required: true
    }
  }
);

orderSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_date field to current date
  this.updated_date = currentDate;

  // if order_date doesn't exist, add to that field
  if (!this.order_date)
    this.order_date = currentDate;

  next();
});

var itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    min: [0],
    required: true
  },
  inventory: {
    type: Number,
    required: true
  },
  orders: [orderSchema],
  updated_date: {
    type: Date
  },
  create_date: {
    type: Date
  },
});

itemSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_date field to current date
  this.updated_date = currentDate;

  // if order_date doesn't exist, add to that field
  if (!this.create_date)
    this.create_date = currentDate;

  next();
});

// Export the model.
var Item = mongoose.model('Item', itemSchema);
var Order = mongoose.model('Order', orderSchema);
module.exports = Item;
