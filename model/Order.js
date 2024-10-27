const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  status: String  // e.g : "shipped"
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
