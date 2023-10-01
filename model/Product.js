// productmodel
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  imageData: String, // To store image data as a base64 string
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
