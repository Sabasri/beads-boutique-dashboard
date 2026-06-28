import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FiUsers, FiSearch, FiDollarSign, FiAward, 
  FiClock, FiTrendingUp, FiEye, FiX, FiCalendar 
} from 'react-icons/fi';
import * as customerService from '../services/customerService';

const CustomerManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [customers, setCustomers] = useState([]);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters (sync with URL query)
  const searchQuery = searchParams.get('search') || '';
  const sortOption = searchParams.get('sort') || 'spend'; // 'spend', 'newest', 'name'

  // Modal State for profile and history
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileOrders, setProfileOrders] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10,
        sort: sortOption
      };
      if (searchQuery) params.search = searchQuery;

      const data = await customerService.getCustomers(params);
      setCustomers(data.customers || []);
      setPages(data.pages || 1);
      setTotalCustomers(data.totalCustomers || 0);
    } catch (err) {
      console.error('Error fetching customers:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, searchQuery, sortOption]);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.set('page', '1');
    setPage(1);
    setSearchParams(newParams);
  };

  const openProfileModal = async (id) => {
    setProfileLoading(true);
    setIsProfileOpen(true);
    try {
      const data = await customerService.getCustomerById(id);
      setProfileData(data.customer);
      setProfileOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching customer profile details:', err.message);
      alert('Error loading profile details. Please try again.');
      setIsProfileOpen(false);
    } finally {
      setProfileLoading(false);
    }
  };

  // Aggregated analytics derived from current data set for headers
  const averageSpend = customers.length > 0 
    ? customers.reduce((sum, c) => sum + c.totalPurchases, 0) / customers.length 
    : 0;

  // Find top spender in-memory
  const topSpender = [...customers].sort((a, b) => b.totalPurchases - a.totalPurchases)[0] || null;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-headings">Customer Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">View customer profiles, analyze purchase frequency, and track individual transaction history</p>
        </div>
      </div>

      {/* Customer Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Customers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm flex items-center">
          <div className="p-3.5 rounded-xl bg-brand-pink/30 text-brand-rosegold mr-4 flex-shrink-0">
            <FiUsers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Customer Base</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-headings mt-1">{totalCustomers} Registered</h3>
          </div>
        </div>

        {/* Average Spend */}
        <div className="p-5 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm flex items-center">
          <div className="p-3.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 mr-4 flex-shrink-0">
            <FiDollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Avg. Lifetime Value</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-headings mt-1">${averageSpend.toFixed(2)}</h3>
          </div>
        </div>

        {/* Top Spender */}
        <div className="p-5 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm flex items-center">
          <div className="p-3.5 rounded-xl bg-brand-gold/20 text-brand-rosegold mr-4 flex-shrink-0">
            <FiAward className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Top Buyer</span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate mt-1">
              {topSpender ? `${topSpender.name} ($${topSpender.totalPurchases.toFixed(0)})` : 'N/A'}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and Table Panel */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm">
        
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-brand-pink/10 dark:border-brand-darkBorder mb-6">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-headings">Customer Database</h3>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search name, email, phone..."
                className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/20 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:bg-white dark:focus:bg-brand-dark transition-all"
              />
            </div>

            {/* Sort */}
            <select
              value={sortOption}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/20 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
            >
              <option value="spend">Sort by: Highest Spending</option>
              <option value="newest">Sort by: Newest Registration</option>
              <option value="name">Sort by: Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Datatable */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-4 py-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-100 dark:bg-brand-dark/30 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
              <FiUsers className="w-12 h-12 mb-4 stroke-1" />
              <h4 className="text-base font-semibold text-slate-600 dark:text-slate-400">No customers found</h4>
              <p className="text-xs mt-1">Try refining your search terms</p>
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-pink/10 dark:border-brand-darkBorder text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pl-2 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold">Phone Number</th>
                    <th className="pb-3 font-semibold">Shipping Address</th>
                    <th className="pb-3 font-semibold">Last Purchase</th>
                    <th className="pb-3 font-semibold text-right">Lifetime Spend</th>
                    <th className="pb-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-pink/5 dark:divide-brand-dark/10 text-sm">
                  {customers.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-brand-dark/15 transition-colors">
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-full bg-brand-lavender text-slate-700 text-xs font-bold mr-3 border border-brand-pink/10">
                            {c.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">{c.name}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-normal block max-w-[160px] truncate" title={c.email}>
                              {c.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-400 font-mono text-xs">
                        {c.phone}
                      </td>
                      <td className="py-3.5 text-slate-500 dark:text-slate-400 text-xs max-w-[200px] truncate" title={c.address}>
                        {c.address}
                      </td>
                      <td className="py-3.5 text-slate-500 dark:text-slate-400 text-xs">
                        {c.lastOrderDate ? (
                          <div className="flex items-center">
                            <FiCalendar className="mr-1.5 w-3.5 h-3.5 text-slate-400" />
                            {new Date(c.lastOrderDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        ) : (
                          'No purchases logged'
                        )}
                      </td>
                      <td className="py-3.5 text-right font-bold text-slate-800 dark:text-slate-350">
                        ${c.totalPurchases.toFixed(2)}
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => openProfileModal(c._id)}
                          className="p-2 text-slate-400 hover:text-brand-rosegold hover:bg-brand-pink/10 rounded-lg transition-all"
                          title="View customer profile & order history"
                        >
                          <FiEye className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-brand-pink/10 dark:border-brand-darkBorder">
                  <p className="text-xs text-slate-500">
                    Showing page <span className="font-bold">{page}</span> of <span className="font-bold">{pages}</span> ({totalCustomers} total customers)
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
      </div>

      {/* Customer Profile & Purchase History Modal */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/20 dark:border-brand-darkBorder shadow-2xl overflow-hidden animate-scale-in">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-pink/10 dark:border-brand-darkBorder">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-headings">
                Customer Profile Details
              </h3>
              <button 
                onClick={() => setIsProfileOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-brand-dark"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {profileLoading || !profileData ? (
              <div className="flex flex-col items-center justify-center py-20">
                <FiLoader className="w-8 h-8 text-brand-rosegold animate-spin" />
                <p className="text-xs text-slate-500 mt-4">Retrieving profile log...</p>
              </div>
            ) : (
              <div className="p-6 max-h-[500px] overflow-y-auto space-y-6">
                {/* Profile summary header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-brand-dark/25 border border-slate-100 dark:border-brand-darkBorder/50">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-lavender text-slate-700 text-2xl font-bold border border-brand-pink/20 flex-shrink-0">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="text-center sm:text-left space-y-1.5 flex-1 min-w-0 text-xs">
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 font-headings">{profileData.name}</h4>
                    <p className="text-slate-500 dark:text-slate-400 font-mono">{profileData.email} • {profileData.phone}</p>
                    <p className="text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
                      <span className="text-slate-400">Shipment Location:</span> {profileData.address}
                    </p>
                  </div>
                  <div className="text-center sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-brand-darkBorder pt-3 sm:pt-0 sm:pl-4 flex-shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Account Spending</span>
                    <p className="text-lg font-black text-brand-rosegold dark:text-brand-pink mt-0.5">${profileData.totalPurchases.toFixed(2)}</p>
                  </div>
                </div>

                {/* Purchase History log */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Purchase History ({profileOrders.length} Orders)</h5>
                  
                  {profileOrders.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs bg-slate-50 dark:bg-brand-dark/10 rounded-2xl border border-dashed border-slate-200 dark:border-brand-darkBorder">
                      No order records found for this customer.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-brand-pink/10 dark:border-brand-darkBorder rounded-xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-brand-dark/40 border-b border-brand-pink/10 dark:border-brand-darkBorder text-slate-400 font-bold uppercase">
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Purchase Date</th>
                            <th className="p-3">Products Purchased</th>
                            <th className="p-3 text-right">Receipt Amount</th>
                            <th className="p-3 text-center">Fulfillment</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-pink/5 dark:divide-brand-dark/10 text-slate-700 dark:text-slate-300">
                          {profileOrders.map((o) => (
                            <tr key={o._id}>
                              <td className="p-3 font-semibold text-slate-800 dark:text-slate-250">{o.orderId}</td>
                              <td className="p-3 text-slate-500">
                                {new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="p-3 max-w-[200px] truncate" title={o.products.map(p => `${p.name} (x${p.quantity})`).join(', ')}>
                                {o.products.map(p => `${p.name} (x${p.quantity})`).join(', ')}
                              </td>
                              <td className="p-3 text-right font-semibold">${o.totalAmount.toFixed(2)}</td>
                              <td className="p-3 text-center">
                                <span className={`inline-block px-2 py-0.5 font-semibold rounded-full
                                  ${o.orderStatus === 'Delivered' ? 'bg-success/10 text-success' : 
                                    o.orderStatus === 'Cancelled' ? 'bg-danger/10 text-danger' : 
                                    o.orderStatus === 'Shipped' ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600' : 'bg-warning/10 text-warning'}
                                `}>
                                  {o.orderStatus}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-brand-pink/10 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/25">
              <button
                onClick={() => setIsProfileOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-white hover:bg-slate-700 focus:outline-none"
              >
                Close Profile Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
