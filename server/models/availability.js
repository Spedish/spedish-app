var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dayOfWeek = new Schema({
  "1": Boolean,
  "2": Boolean,
  "3": Boolean,
  "4": Boolean,
  "5": Boolean,
  "6": Boolean,
  "0": Boolean
});

var pickupWindow = new Schema({
  start_time: String,
  end_time: String,
  status: Boolean
});

var pickupWindows = new Schema({
  lunch: pickupWindow,
  dinner: pickupWindow,
  free_sell: Boolean
});

var availabilitySchema = new Schema({
  day_of_week: dayOfWeek,
  lead_time: {
    type: Number,
    required: true
  },
  pickup_window: pickupWindows
}, {
  timestamps: true
});

// Export the model.
var Availability = mongoose.model('Availability', availabilitySchema);
module.exports = Availability;
