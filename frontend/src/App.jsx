import React, { useState, useRef, useEffect } from 'react';

const App = () => {
  const [showAddProducts, setShowAddProducts] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image: ''
  });
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All Category']);
  const [selectedCategory, setSelectedCategory] = useState('All Category');
  const [searchQuery, setSearchQuery] = useState('');
  const formRef = useRef();

  // Fetch products on mount or when category changes
  useEffect(() => {
    fetchProducts(selectedCategory);
  }, [selectedCategory]);

  const fetchProducts = async (category) => {
    try {
      const url = category === 'All Category'
        ? 'http://localhost:5000/products'
        : `http://localhost:5000/products?category=${category}`;

      const res = await fetch(url);
      const data = await res.json();

      const productList = Array.isArray(data)
        ? data
        : Object.values(data).flat();

      setProducts(productList);

      if (category === 'All Category') {
        const uniqueCats = ['All Category', ...new Set(productList.map(p => p.category))];
        setCategories(uniqueCats);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleBackdropClick = (e) => {
    if (formRef.current && !formRef.current.contains(e.target)) {
      setShowAddProducts(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to add product");
        return;
      }

      const newProduct = await res.json();
      setShowAddProducts(false);
      setFormData({ name: '', price: '', category: '', description: '', image: '' });

      // Re-fetch after add
      fetchProducts(selectedCategory);
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Something went wrong');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center px-4 bg-gray-100 shadow rounded-md mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-1">Product Catalog</h3>
          <p className="text-gray-600 text-sm">Manage your e-commerce inventory</p>
        </div>
        <button
          onClick={() => setShowAddProducts(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded"
        >
          + Add Product
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="relative w-full md:w-2/4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
            width="20" height="20"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap gap-3 md:justify-end">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1 text-sm rounded-full border ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product._id} className="bg-white rounded shadow p-4 flex flex-col h-full">
              {product.image && (
                <div className="overflow-hidden rounded mb-3 h-48 w-full">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              <h4 className="text-lg font-semibold line-clamp-1">{product.name}</h4>
              <p className="text-sm text-gray-500 mb-1">{product.category}</p>
              <p className="text-sm text-gray-700 mb-2 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center mt-auto pt-2">
                <p className="text-blue-600 font-bold">₹ {product.price}</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-1.5 px-4 rounded">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No products found.</p>
      )}

      {/* Modal Form */}
      {showAddProducts && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={handleBackdropClick}
        >
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="max-w-xl w-full mx-4 p-6 bg-white shadow-lg rounded-md space-y-5"
          >
            {[{ name: 'name', type: 'text', label: 'Product Name' },
              { name: 'price', type: 'number', label: 'Price' },
              { name: 'description', type: 'text', label: 'Description' },
              { name: 'image', type: 'text', label: 'Image URI (optional)' }].map(
              ({ name, type, label }) => (
                <div key={name}>
                  <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
                  <input
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    type={type}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={name !== 'image'}
                  />
                </div>
              )
            )}

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select category</option>
                <option>Electronics</option>
                <option>Homes & Kitchen</option>
                <option>Furniture</option>
                <option>Clothing</option>
                <option>Books</option>
                <option>Sports</option>
              </select>
            </div>

            <div className="text-right space-x-3">
              <button
                type="button"
                onClick={() => setShowAddProducts(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md"
              >
                Add Product
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
