const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,  

  isAdmin: {
    type: Boolean,
    default: false
  }

});

const User = mongoose.model('User', userSchema);

module.exports = User;
