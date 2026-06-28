import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, 
  FiFilter, FiX, FiCheck, FiLoader, FiAlertCircle 
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import * as productService from '../services/productService';

const ProductManagement = () => {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State variables
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters state (synchronized with URL search params)
  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || 'All';
  const statusFilter = searchParams.get('status') || 'All';
  const sortOption = searchParams.get('sort') || 'newest';

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Handmade Bracelets',
    price: '',
    quantity: '',
    reorderLevel: '10',
    image: '',
    description: ''
  });

  const categories = ['Handmade Bracelets', 'Earrings', 'Customized Jewelry', 'Gift Accessories'];

  // Load products based on filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        sort: sortOption
      };
      if (searchQuery) params.search = searchQuery;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const data = await productService.getProducts(params);
      setProducts(data.products || []);
      setPages(data.pages || 1);
      setTotalProducts(data.totalProducts || 0);
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, searchQuery, categoryFilter, statusFilter, sortOption]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All' || !value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.set('page', '1'); // reset to page 1 on filter change
    setPage(1);
    setSearchParams(newParams);
  };

  // Open Add Modal
  const openAddModal = () => {
    if (!isAdmin) return;
    setIsEditMode(false);
    setFormData({
      name: '',
      sku: '',
      category: 'Handmade Bracelets',
      price: '',
      quantity: '',
      reorderLevel: '10',
      image: '',
      description: ''
    });
    setError('');
    setIsAddEditOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (product) => {
    setIsEditMode(true);
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      reorderLevel: product.reorderLevel.toString(),
      image: product.image,
      description: product.description
    });
    setError('');
    setIsAddEditOpen(true);
  };

  // Open View Modal
  const openViewModal = (product) => {
    setSelectedProduct(product);
    setIsViewOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitLoading(true);

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity),
      reorderLevel: parseInt(formData.reorderLevel)
    };

    try {
      if (isEditMode && selectedProduct) {
        await productService.updateProduct(selectedProduct._id, payload);
      } else {
        await productService.createProduct(payload);
      }
      setIsAddEditOpen(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing product. Please check your inputs.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (id) => {
    if (!isAdmin) return;
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await productService.deleteProduct(id);
        fetchProducts();
      } catch (err) {
        alert('Failed to delete product. Please try again.');
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-headings">Product Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add, edit, or delete items in the boutique inventory</p>
        </div>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="flex items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-xl bg-brand-rosegold text-white hover:bg-brand-rosegold/95 transition-all shadow-md shadow-brand-rosegold/25"
          >
            <FiPlus className="mr-2 w-4.5 h-4.5" /> Add New Product
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm flex flex-col lg:flex-row gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark/30 border border-slate-200 dark:border-brand-darkBorder focus:bg-white dark:focus:bg-brand-dark text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <FiFilter className="text-slate-400 w-4 h-4" />
          <select
            value={categoryFilter}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/30 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/30 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
          >
            <option value="All">All Stock Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        {/* Sort option */}
        <div className="flex items-center space-x-2">
          <select
            value={sortOption}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/30 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="stock_asc">Stock: Low to High</option>
            <option value="stock_desc">Stock: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Datatable */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm overflow-hidden">
        {loading ? (
          <div className="space-y-4 py-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-brand-dark/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
            <FiSearch className="w-12 h-12 mb-4 stroke-1" />
            <h4 className="text-base font-semibold text-slate-600 dark:text-slate-400">No products found</h4>
            <p className="text-xs mt-1">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-pink/10 dark:border-brand-darkBorder text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pl-2 font-semibold">Product</th>
                    <th className="pb-3 font-semibold">SKU</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold text-right">Price</th>
                    <th className="pb-3 font-semibold text-right">Stock</th>
                    <th className="pb-3 font-semibold text-center">Status</th>
                    <th className="pb-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-pink/5 dark:divide-brand-dark/10 text-sm">
                  {products.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-brand-dark/15 transition-colors">
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-10 h-10 rounded-xl object-cover mr-3.5 border border-brand-pink/10" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-brand-pink/20 flex items-center justify-center mr-3.5 border border-brand-pink/10 text-brand-rosegold">
                              <FiGrid className="w-5 h-5" />
                            </div>
                          )}
                          <span className="font-semibold text-slate-800 dark:text-slate-200 max-w-[200px] truncate block" title={p.name}>
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {p.sku}
                      </td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-400">
                        {p.category}
                      </td>
                      <td className="py-3.5 text-right font-semibold text-slate-800 dark:text-slate-300">
                        ${p.price.toFixed(2)}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className={`font-semibold ${p.quantity <= p.reorderLevel ? 'text-danger' : 'text-slate-700 dark:text-slate-300'}`}>
                          {p.quantity}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Lvl: {p.reorderLevel}</span>
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full
                          ${p.status === 'In Stock' ? 'bg-success/10 text-success' : 
                            p.status === 'Out of Stock' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}
                        `}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => openViewModal(p)}
                            className="p-2 text-slate-400 hover:text-brand-rosegold hover:bg-brand-pink/10 rounded-lg transition-all"
                            title="View product details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-lg transition-all"
                            title="Edit product"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          {isAdmin ? (
                            <button
                              onClick={() => handleDeleteProduct(p._id)}
                              className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-all"
                              title="Delete product"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <div className="p-2 text-slate-200 dark:text-brand-dark/40 cursor-not-allowed" title="Delete (Admin Only)">
                              <FiTrash2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-brand-pink/10 dark:border-brand-darkBorder">
                <p className="text-xs text-slate-500">
                  Showing page <span className="font-bold">{page}</span> of <span className="font-bold">{pages}</span> ({totalProducts} total products)
                </p>
                <div className="flex space-x-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-brand-darkBorder text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-brand-dark disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === pages}
                    onClick={() => setPage(prev => Math.min(pages, prev + 1))}
                    className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-brand-darkBorder text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-brand-dark disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isAddEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/20 dark:border-brand-darkBorder shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-pink/10 dark:border-brand-darkBorder">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-headings">
                {isEditMode ? 'Edit Jewelry Product' : 'Add New Jewelry Product'}
              </h3>
              <button 
                onClick={() => setIsAddEditOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-brand-dark"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 max-h-[500px] overflow-y-auto space-y-4">
                {error && (
                  <div className="flex items-start p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-xs">
                    <FiAlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Product Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="E.g. Sweetheart Rose Quartz Bracelet"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/30 focus:bg-white dark:focus:bg-brand-dark text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-rosegold transition-all"
                    />
                  </div>

                  {/* SKU */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Product SKU</label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                      placeholder="E.g. BRAC-1001"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/30 focus:bg-white dark:focus:bg-brand-dark text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-rosegold transition-all font-mono"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/30 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-rosegold transition-all"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="E.g. 29.99"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/30 focus:bg-white dark:focus:bg-brand-dark text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-rosegold transition-all"
                    />
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="E.g. 35"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/30 focus:bg-white dark:focus:bg-brand-dark text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-rosegold transition-all"
                    />
                  </div>

                  {/* Reorder Level */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Reorder Level Alert</label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formData.reorderLevel}
                      onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                      placeholder="E.g. 10"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/30 focus:bg-white dark:focus:bg-brand-dark text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-rosegold transition-all"
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Product Image (Unsplash / web URL)</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/30 focus:bg-white dark:focus:bg-brand-dark text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-rosegold transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Product Description</label>
                  <textarea
                    required
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide details about materials, bead sizes, craft style, and fit..."
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/30 focus:bg-white dark:focus:bg-brand-dark text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-rosegold transition-all resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end px-6 py-4 border-t border-brand-pink/10 dark:border-brand-darkBorder space-x-3 bg-slate-50 dark:bg-brand-dark/25">
                <button
                  type="button"
                  onClick={() => setIsAddEditOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-brand-darkBorder text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-xl bg-brand-rosegold text-white hover:bg-brand-rosegold/95 shadow-md shadow-brand-rosegold/25 disabled:opacity-50"
                >
                  {submitLoading ? (
                    <>
                      <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <FiCheck className="mr-2 w-4.5 h-4.5" />
                      {isEditMode ? 'Save Changes' : 'Add Product'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/20 dark:border-brand-darkBorder shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-pink/10 dark:border-brand-darkBorder">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-headings">
                Jewelry Details
              </h3>
              <button 
                onClick={() => setIsViewOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-brand-dark"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Large Image */}
                <div className="w-full sm:w-1/2 flex-shrink-0">
                  {selectedProduct.image ? (
                    <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-48 sm:h-56 rounded-2xl object-cover border border-brand-pink/20" />
                  ) : (
                    <div className="w-full h-48 sm:h-56 rounded-2xl bg-brand-pink/20 flex items-center justify-center border border-brand-pink/20 text-brand-rosegold text-4xl">
                      <FiGrid />
                    </div>
                  )}
                </div>

                {/* Core specifications */}
                <div className="flex-1 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-rosegold dark:text-brand-pink">{selectedProduct.category}</span>
                    <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 font-headings leading-tight mt-0.5">{selectedProduct.name}</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400">SKU Number</p>
                      <p className="font-mono font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{selectedProduct.sku}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Unit Price</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">${selectedProduct.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Available Stock</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{selectedProduct.quantity} units</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Stock Status</p>
                      <span className={`inline-block px-2 py-0.5 font-semibold rounded-full mt-0.5
                        ${selectedProduct.status === 'In Stock' ? 'bg-success/10 text-success' : 
                          selectedProduct.status === 'Out of Stock' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}
                      `}>
                        {selectedProduct.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-brand-pink/10 dark:border-brand-darkBorder">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Description & Craftsmanship</h5>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-brand-dark/30 p-3 rounded-xl border border-slate-100 dark:border-brand-darkBorder/50">
                  {selectedProduct.description}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-brand-pink/10 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/25">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-white hover:bg-slate-700 focus:outline-none"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
