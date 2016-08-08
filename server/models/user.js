var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  isSeller: {
    type: Boolean,
    required: true
  },

  firstname: String,
  lastname: String,
  address: String, // Need more work afterwards, but Google map Geocoding service can convert addresses (like "1600 Amphitheatre Parkway, Mountain View, CA") into geographic coordinates
  city: String,
  zip: String,
  contact: String,
  about: String,

  thirdParty_source: String,
  thirdParty_id: String,
  thirdParty_token: String,
  thirdParty_email: String,
  thirdParty_name: String

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
