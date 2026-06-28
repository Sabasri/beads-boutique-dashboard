import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiGrid, FiShoppingBag, FiUsers, FiLoader } from 'react-icons/fi';
import * as productService from '../services/productService';
import * as orderService from '../services/orderService';
import * as customerService from '../services/customerService';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ products: [], orders: [], customers: [] });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search logic
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ products: [], orders: [], customers: [] });
      setLoading(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const [prodRes, orderRes, custRes] = await Promise.all([
          productService.getProducts({ search: query, limit: 5 }),
          orderService.getOrders({ search: query, limit: 5 }),
          customerService.getCustomers({ search: query, limit: 5 })
        ]);

        setResults({
          products: prodRes.products || [],
          orders: orderRes.orders || [],
          customers: custRes.customers || []
        });
      } catch (err) {
        console.error('Error during global search:', err.message);
      } finally {
        setLoading(false);
      }
    }, 350); // 350ms debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (path) => {
    navigate(path);
    setQuery('');
    setIsOpen(false);
  };

  const clearSearch = () => {
    setQuery('');
    setIsOpen(false);
  };

  const hasResults = results.products.length > 0 || results.orders.length > 0 || results.customers.length > 0;

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search products, orders, customers..."
          className="w-full pl-11 pr-10 py-2.5 text-sm rounded-xl bg-slate-100 dark:bg-brand-dark/50 border border-transparent focus:border-brand-pink/50 dark:focus:border-brand-darkBorder focus:bg-white dark:focus:bg-brand-darkSecondary text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition-all duration-200"
        />
        {loading && (
          <FiLoader className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 animate-spin w-4 h-4" />
        )}
        {!loading && query && (
          <button onClick={clearSearch} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Dropdown Results */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 mt-2 z-50 rounded-2xl border border-brand-pink/20 dark:border-brand-darkBorder bg-white/95 dark:bg-brand-darkSecondary/95 shadow-xl backdrop-blur-md max-h-[450px] overflow-y-auto animate-fade-in">
          {loading && !hasResults && (
            <div className="flex items-center justify-center py-8 text-slate-500 dark:text-slate-400 text-sm">
              <FiLoader className="w-5 h-5 mr-3 animate-spin text-brand-rosegold" />
              Searching database...
            </div>
          )}

          {!loading && !hasResults && (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              No matches found for "{query}"
            </div>
          )}

          {hasResults && (
            <div className="p-2 space-y-4">
              {/* Products Section */}
              {results.products.length > 0 && (
                <div>
                  <div className="flex items-center px-3 py-1.5 text-xs font-semibold text-brand-rosegold dark:text-brand-pink uppercase tracking-wider">
                    <FiGrid className="mr-2 w-3.5 h-3.5" /> Products
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {results.products.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => handleSelect(`/products?search=${p.sku}`)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-left hover:bg-brand-pink/10 dark:hover:bg-brand-darkBorder/40 transition-colors duration-150"
                      >
                        <div className="flex items-center min-w-0 mr-4">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover mr-3 flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-brand-pink/30 flex items-center justify-center mr-3 flex-shrink-0 text-slate-500">
                              <FiGrid className="w-4 h-4" />
                            </div>
                          )}
                          <div className="truncate">
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{p.name}</p>
                            <p className="text-xs text-slate-400 dark:text-slate-500">{p.sku} • {p.category}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-300">${p.price.toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Orders Section */}
              {results.orders.length > 0 && (
                <div>
                  <div className="flex items-center px-3 py-1.5 text-xs font-semibold text-brand-rosegold dark:text-brand-pink uppercase tracking-wider">
                    <FiShoppingBag className="mr-2 w-3.5 h-3.5" /> Orders
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {results.orders.map((o) => (
                      <button
                        key={o._id}
                        onClick={() => handleSelect(`/orders?search=${o.orderId}`)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-left hover:bg-brand-pink/10 dark:hover:bg-brand-darkBorder/40 transition-colors duration-150"
                      >
                        <div className="min-w-0 mr-4">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{o.orderId}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">Cust: {o.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">${o.totalAmount.toFixed(2)}</p>
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full mt-0.5
                            ${o.orderStatus === 'Delivered' ? 'bg-success/10 text-success' : 
                              o.orderStatus === 'Cancelled' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}
                          `}>
                            {o.orderStatus}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customers Section */}
              {results.customers.length > 0 && (
                <div>
                  <div className="flex items-center px-3 py-1.5 text-xs font-semibold text-brand-rosegold dark:text-brand-pink uppercase tracking-wider">
                    <FiUsers className="mr-2 w-3.5 h-3.5" /> Customers
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {results.customers.map((c) => (
                      <button
                        key={c._id}
                        onClick={() => handleSelect(`/customers?search=${c.name}`)}
                        className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-left hover:bg-brand-pink/10 dark:hover:bg-brand-darkBorder/40 transition-colors duration-150"
                      >
                        <div className="min-w-0 mr-4">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{c.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{c.email}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total spent</p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">${c.totalPurchases.toFixed(2)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
