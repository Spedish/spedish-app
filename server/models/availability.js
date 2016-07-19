var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dayOfWeek = new Schema({
  monday: Boolean,
  tuesday: Boolean,
  wednesday: Boolean,
  thursday: Boolean,
  friday: Boolean,
  saturday: Boolean,
  sunday: Boolean
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
