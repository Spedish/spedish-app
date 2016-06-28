var mongoose = require('mongoose');

var GallerySchema = new mongoose.Schema({
  Order: {
    type: String,
    required: false
  },
});

// Export the model.
module.exports = mongoose.model('gallery', GallerySchema);
