import React, { useState, useEffect } from 'react';
import {
  FiDollarSign, FiLayers, FiSearch, FiRefreshCw,
  FiAlertTriangle, FiAlertOctagon, FiMinus, FiPlus, FiLoader
} from 'react-icons/fi';
import * as productService from '../services/productService';
import * as analyticsService from '../services/analyticsService';

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adjustingId, setAdjustingId] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'healthy', 'low', 'out'

  const categories = ['Handmade Bracelets', 'Earrings', 'Customized Jewelry', 'Gift Accessories'];

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      // Fetch all products (limit 100 to get full inventory overview)
      const prodData = await productService.getProducts({ limit: 100 });
      setProducts(prodData.products || []);

      // Fetch advanced analytics details for inventory
      const advData = await analyticsService.getAdvancedAnalytics();
      setAnalytics(advData);
    } catch (err) {
      console.error('Error fetching inventory data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryData();
  }, []);

  // Handlers for quick stock adjustment (+ / -)
  const adjustStock = async (product, amount) => {
    const newQty = Math.max(0, product.quantity + amount);
    if (newQty === product.quantity) return;

    setAdjustingId(product._id);
    try {
      await productService.updateProduct(product._id, {
        quantity: newQty
      });

      // Update local state immediately for snappy UX
      setProducts(prev => prev.map(p => {
        if (p._id === product._id) {
          const updatedP = { ...p, quantity: newQty };
          // Re-evaluate status locally
          if (newQty === 0) updatedP.status = 'Out of Stock';
          else if (newQty <= p.reorderLevel) updatedP.status = 'Low Stock';
          else updatedP.status = 'In Stock';
          return updatedP;
        }
        return p;
      }));
    } catch (err) {
      console.error('Failed to adjust stock:', err.message);
      alert('Error updating stock level. Please try again.');
    } finally {
      setAdjustingId(null);
    }
  };

  // Calculations for KPI Cards
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
  const outOfStockCount = products.filter(p => p.quantity === 0).length;
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= p.reorderLevel).length;

  // Derive critical alert items (either out of stock or low stock)
  const alertItems = products.filter(p => p.quantity <= p.reorderLevel);

  // Apply filters on client-side for smooth real-time sorting
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || p.category === category;

    let matchesStatus = true;
    if (statusFilter === 'out') matchesStatus = p.quantity === 0;
    else if (statusFilter === 'low') matchesStatus = p.quantity > 0 && p.quantity <= p.reorderLevel;
    else if (statusFilter === 'healthy') matchesStatus = p.quantity > p.reorderLevel;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="h-10 w-48 bg-slate-200 dark:bg-brand-darkBorder rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-brand-darkBorder rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-slate-200 dark:bg-brand-darkBorder rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-headings">
            Inventory Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor stock health, reorder levels, and perform quick quantity corrections
          </p>
        </div>
        <button
          onClick={fetchInventoryData}
          className="flex items-center justify-center self-start sm:self-auto px-4 py-2.5 text-xs font-semibold rounded-xl border border-brand-pink/30 dark:border-brand-darkBorder bg-white dark:bg-brand-darkSecondary text-brand-rosegold dark:text-brand-pink hover:bg-brand-pink/10 transition-colors"
        >
          <FiRefreshCw className="mr-2 w-4 h-4" /> Sync Inventory
        </button>
      </div>

      {/* Inventory KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Value */}
        <div className="p-5 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inventory Value</span>
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/30 text-amber-600">
              <FiDollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-headings mt-3">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">Based on current unit price</p>
        </div>

        {/* Total Units */}
        <div className="p-5 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Available Units</span>
            <div className="p-2.5 rounded-xl bg-brand-pink/30 text-brand-rosegold">
              <FiLayers className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-headings mt-3">
            {totalUnits}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">Physical count across all items</p>
        </div>

        {/* Out of Stock */}
        <div className="p-5 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Out of Stock</span>
            <div className={`p-2.5 rounded-xl ${outOfStockCount > 0 ? 'bg-danger/10 text-danger animate-pulse' : 'bg-success/10 text-success'}`}>
              <FiAlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <h3 className={`text-xl font-bold font-headings mt-3 ${outOfStockCount > 0 ? 'text-danger' : 'text-slate-800 dark:text-slate-100'}`}>
            {outOfStockCount}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">
            {outOfStockCount > 0 ? 'Requires immediate restock' : 'All items in stock'}
          </p>
        </div>

        {/* Low Stock */}
        <div className="p-5 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Items</span>
            <div className={`p-2.5 rounded-xl ${lowStockCount > 0 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
              <FiAlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <h3 className={`text-xl font-bold font-headings mt-3 ${lowStockCount > 0 ? 'text-warning' : 'text-slate-800 dark:text-slate-100'}`}>
            {lowStockCount}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">
            {lowStockCount > 0 ? 'Approaching critical level' : 'Stock levels healthy'}
          </p>
        </div>
      </div>

      {/* Critical Stock Alerts Banner Panel */}
      {alertItems.length > 0 && (
        <div className="p-5 rounded-2xl border border-danger/20 bg-danger/5 text-danger flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
          <div className="flex items-start">
            <FiAlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5 animate-bounce" />
            <div>
              <h4 className="text-sm font-bold font-headings">Critical Stock Alerts Detected</h4>
              <p className="text-xs text-danger/80 mt-0.5">
                There are <span className="font-bold">{outOfStockCount} out-of-stock</span> and{' '}
                <span className="font-bold">{lowStockCount} low-stock</span> products below reorder thresholds.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('low')}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-danger text-white hover:bg-danger/90 transition-all self-start md:self-auto"
          >
            Filter Low Stock Items
          </button>
        </div>
      )}

      {/* Main Inventory Board */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm">

        {/* Table Filters Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-6 border-b border-brand-pink/10 dark:border-brand-darkBorder mb-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-headings">
            Inventory Monitoring
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search SKU or name..."
                className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/20 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:bg-white dark:focus:bg-brand-dark transition-all"
              />
            </div>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/20 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
            >
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Stock status filter buttons */}
            <div className="flex p-1 bg-slate-100 dark:bg-brand-dark rounded-xl text-xs">
              {[
                { key: 'All', label: 'All', color: 'text-brand-rosegold dark:text-brand-pink' },
                { key: 'low', label: 'Low', color: 'text-warning' },
                { key: 'out', label: 'Out', color: 'text-danger' },
                { key: 'healthy', label: 'Healthy', color: 'text-success' },
              ].map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-1.5 font-semibold rounded-lg transition-colors ${
                    statusFilter === key
                      ? `bg-white dark:bg-brand-darkSecondary shadow-sm ${color}`
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Datatable */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-pink/10 dark:border-brand-darkBorder text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3 pl-2 font-semibold">Product</th>
                <th className="pb-3 font-semibold">SKU</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold text-right">Reorder Threshold</th>
                <th className="pb-3 font-semibold text-center">Status</th>
                <th className="pb-3 font-semibold text-center">Current Stock</th>
                <th className="pb-3 font-semibold text-center">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-pink/5 dark:divide-brand-dark/10 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <FiLayers className="w-10 h-10 mx-auto mb-3 stroke-1" />
                    <h4 className="font-semibold text-slate-600 dark:text-slate-400">
                      No inventory items match filters
                    </h4>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50 dark:hover:bg-brand-dark/15 transition-colors">
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover mr-3 border border-brand-pink/10"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-brand-pink/20 flex items-center justify-center mr-3 border border-brand-pink/10 text-brand-rosegold">
                            <FiLayers className="w-4 h-4" />
                          </div>
                        )}
                        <span
                          className="font-semibold text-slate-800 dark:text-slate-200 max-w-[180px] truncate block"
                          title={p.name}
                        >
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
                    <td className="py-3.5 text-right font-medium text-slate-600 dark:text-slate-400">
                      {p.reorderLevel} units
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full
                        ${p.status === 'In Stock'
                          ? 'bg-success/10 text-success'
                          : p.status === 'Out of Stock'
                          ? 'bg-danger/10 text-danger'
                          : 'bg-warning/10 text-warning'}
                      `}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`text-sm font-bold px-3 py-1 rounded-lg
                        ${p.quantity === 0
                          ? 'bg-danger/10 text-danger'
                          : p.quantity <= p.reorderLevel
                          ? 'bg-warning/10 text-warning'
                          : 'bg-slate-100 dark:bg-brand-dark text-slate-800 dark:text-slate-200'}
                      `}>
                        {p.quantity}
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <div className="inline-flex items-center justify-center p-1 bg-slate-100 dark:bg-brand-dark rounded-xl border border-slate-200 dark:border-brand-darkBorder">
                        {adjustingId === p._id ? (
                          <div className="px-8 py-1.5 flex items-center justify-center">
                            <FiLoader className="w-4 h-4 text-brand-rosegold animate-spin" />
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => adjustStock(p, -1)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-rosegold hover:bg-white dark:hover:bg-brand-darkSecondary transition-colors focus:outline-none"
                              title="Decrease stock by 1"
                              disabled={p.quantity === 0}
                            >
                              <FiMinus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center font-bold text-xs text-slate-800 dark:text-slate-200">
                              {p.quantity}
                            </span>
                            <button
                              onClick={() => adjustStock(p, 1)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-rosegold hover:bg-white dark:hover:bg-brand-darkSecondary transition-colors focus:outline-none"
                              title="Increase stock by 1"
                            >
                              <FiPlus className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer summary */}
        {filteredProducts.length > 0 && (
          <p className="mt-4 text-xs text-slate-400 text-right">
            Showing <span className="font-semibold text-slate-600 dark:text-slate-400">{filteredProducts.length}</span> of{' '}
            <span className="font-semibold text-slate-600 dark:text-slate-400">{products.length}</span> products
          </p>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;
