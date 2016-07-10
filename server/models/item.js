var mongoose = require('mongoose');
var orderModel = require('./order');

var itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  unit_price: {
    type: Number,
    min: [0],
    required: true
  },
  inventory: {
    type: Number,
    required: true
  },
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  update_date: {
    type: Date
  },
  create_date: {
    type: Date
  },
  _gallery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'gallery',
    required: false
  }
});

itemSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the update_date field to current date
  this.update_date = currentDate;

  // if order_date doesn't exist, add to that field
  if (!this.create_date)
    this.create_date = currentDate;

  next();
});

var autoPopulateGallery = function(next) {
  this.populate('_gallery');
  next();
}

itemSchema.pre('findOne', autoPopulateGallery);

// Export the model.
var Item = mongoose.model('Item', itemSchema);
module.exports = Item;
