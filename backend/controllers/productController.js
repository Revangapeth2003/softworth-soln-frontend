// controllers/productController.js
const Product = require('../models/Product');

// POST: Add Product with Duplicate Check
exports.addProduct = async (req, res) => {
  try {
    const existing = await Product.findOne({ name: req.body.name });
    if (existing) {
      return res.status(400).json({ error: 'Product with this name already exists.' });
    }

    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET: All Products (Flat or by Category)
exports.getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== 'All Category' ? { category } : {};
    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET: Search Products by Name or Category
exports.searchProducts = async (req, res) => {
  try {
    const query = req.query.q;
    const results = await Product.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
      ],
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT: Update Product by ID
exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE: Delete Product by ID
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
