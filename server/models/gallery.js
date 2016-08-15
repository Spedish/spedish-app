var mongoose = require('mongoose');

var GallerySchema = new mongoose.Schema({
  order: {
    type: Object,
    required: false
  },
  _uid: {
    type: String,
    require: true
  }
});

// Export the model.
module.exports = mongoose.model('gallery', GallerySchema);
