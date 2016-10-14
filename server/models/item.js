var mongoose = require('mongoose');
var orderModel = require('./order');
var orderController = require("../controllers/order");

var dayOfWeek = new mongoose.Schema({
  "1": Boolean,
  "2": Boolean,
  "3": Boolean,
  "4": Boolean,
  "5": Boolean,
  "6": Boolean,
  "0": Boolean
});

var pickupWindow = new mongoose.Schema({
  start_time: String,
  end_time: String,
  status: Boolean
});

var pickupWindows = new mongoose.Schema({
  lunch: pickupWindow,
  dinner: pickupWindow,
  free_sell: Boolean
});

var availabilitySchema = new mongoose.Schema({
    day_of_week: dayOfWeek,
    lead_time: {
      type: Number,
      required: true
    },
    pickup_window: pickupWindows,
    timezone: String,
    _uid: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

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
  availability: availabilitySchema,
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  update_date: {
    type: Date
  },
  create_date: {
    type: Date
  },
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  zip: {
    type: String,
    required: true
  },
  contact_name: {
    type: String,
    required: true
  },
  contact_number: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        var validCategories = ['CatA', 'CatB'];

        if (!v)
          return true;

        var c = v.split(',');
        c.forEach(function(cat, idx, arr) {
          if (validCategories.indexOf(cat) <= -1)
            return false;
        });

        return true;
      },
      message: '{VALUE} contains invalid category'
    }
  },
  meal_options: {
    type: String,
    required: false,
    validate: {
      validator: function(v) {
        var validOptions = ['Vegetarian', 'Vegan'];

        if (!v)
          return true;

        var o = v.split(',');
        o.forEach(function(opt, idx, arr) {
          if (validOptions.indexOf(opt) <= -1)
            return false;
        });

        return true;
      },
      message: '{VALUE} contains invalid option'
    }
  },
  rating_count: {
    type: Number,
    default: 0,
    required: false
  },
  review_count: {
    type: Number,
    default: 0,
    required: false
  },
  _gallery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'gallery',
    required: false
  },
  _uid: {
    type: String,
    required: true
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

// populate all referenced collections on item
var autoPopulate = function(next) {
  this.populate('_gallery');
  next();
}

itemSchema.pre('findOne', autoPopulate);
itemSchema.pre('find', autoPopulate);

// Export the model.
var Item = mongoose.model('Item', itemSchema);
module.exports = Item;
