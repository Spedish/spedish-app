var mongoose = require('mongoose');

var GallerySchema = new mongoose.Schema({
  order: {
    type: Object,
    required: false
  },
});

// Export the model.
module.exports = mongoose.model('gallery', GallerySchema);
