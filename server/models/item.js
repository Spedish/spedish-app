var mongoose = require('mongoose');
var orderModel = require('./order');
var availabilityModel = require('./availability');
var orderController = require("../controllers/order");


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
  availability: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Availability'
  },
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
  this.populate('orders');
  this.populate('availability');
  next();
}

var order = {};
order.count = 1;

// apply complex logic filter
var applyPreFilter = function(next) {
  this._postConditions = {};

  // Skip known keywords, since we will be doing post processing on it
  if (this._conditions.pickup) {
    this._postConditions['pickup'] = this._conditions.pickup;
    order.pick_up_date = this._conditions.pickup;
    delete this._conditions['pickup'];
  }

  next();
}

var isAvailable = function(item) {
  return orderController.checkAvailability(item, order);
}

var applyPostFilter = function(results, next) {
  if (this._postConditions.pickup)
  {
    console.log("perform post processing on this");

    // if (!isAvailable(JSON.stringify(docs))) {
    //   docs.doc = {};
    // }
    results = results.filter(isAvailable);

    //console.log(aa);
    console.log(results);
  }
  next();
}

itemSchema.pre('findOne', autoPopulate);
itemSchema.pre('find', applyPreFilter);
itemSchema.pre('find', autoPopulate);
itemSchema.pre('count', applyPreFilter);
itemSchema.post('find', applyPostFilter);

// Export the model.
var Item = mongoose.model('Item', itemSchema);
module.exports = Item;
