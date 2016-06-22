var mongoose = require('mongoose');

var ItemSchema = new mongoose.Schema({
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
    required: true
  },
  inventory: {
    type: Number,
    required: true
  }
});

// Export the model.
module.exports = mongoose.model('item', ItemSchema);
