// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  category: {
    type: String,
    required: true,
    enum: ["Electronics", "Homes & Kitchen", "Furniture", "Clothing", "Books", "Sports"],
  },
  description: { type: String, required: true },
  image: { type: String, required: true },
});

module.exports = mongoose.model('Product', productSchema);
