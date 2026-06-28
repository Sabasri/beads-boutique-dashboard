import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiShoppingBag, FiSearch, FiEye, FiX
} from 'react-icons/fi';
import * as orderService from '../services/orderService';

const OrderManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // URL synced filters
  const searchQuery = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'All';
  const paymentFilter = searchParams.get('payment') || 'All';

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [orderStatusVal, setOrderStatusVal] = useState('Pending');
  const [paymentStatusVal, setPaymentStatusVal] = useState('Pending');
  const [updateLoading, setUpdateLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 10
      };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (paymentFilter !== 'All') params.paymentStatus = paymentFilter;

      const data = await orderService.getOrders(params);
      setOrders(data.orders || []);
      setPages(data.pages || 1);
      setTotalOrders(data.totalOrders || 0);
    } catch (err) {
      console.error('Error fetching orders:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, searchQuery, statusFilter, paymentFilter]);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'All' || !value) {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    newParams.set('page', '1');
    setPage(1);
    setSearchParams(newParams);
  };

  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setOrderStatusVal(order.orderStatus);
    setPaymentStatusVal(order.paymentStatus);
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdateLoading(true);
    try {
      await orderService.updateOrderStatus(selectedOrder._id, {
        orderStatus: orderStatusVal,
        paymentStatus: paymentStatusVal
      });
      setIsDetailsOpen(false);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err.message);
      alert('Error updating order. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-headings">Order Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">View customer receipts, modify fulfillment status, and track payment transactions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm flex flex-col lg:flex-row gap-4">

        {/* Search */}
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Search Order ID or customer name..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-brand-dark/30 border border-slate-200 dark:border-brand-darkBorder focus:bg-white dark:focus:bg-brand-dark text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-pink/20 transition-all"
          />
        </div>

        {/* Fulfillment Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium">Fulfillment:</span>
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/30 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Payment Status Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-medium">Payment:</span>
          <select
            value={paymentFilter}
            onChange={(e) => handleFilterChange('payment', e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/30 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
          >
            <option value="All">All Payments</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm overflow-hidden">
        {loading ? (
          <div className="space-y-4 py-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-brand-dark/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
            <FiShoppingBag className="w-12 h-12 mb-4 stroke-1" />
            <h4 className="text-base font-semibold text-slate-600 dark:text-slate-400">No orders found</h4>
            <p className="text-xs mt-1">Try broadening your search criteria</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-pink/10 dark:border-brand-darkBorder text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pl-2 font-semibold">Order ID</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Customer</th>
                    <th className="pb-3 font-semibold text-right">Items</th>
                    <th className="pb-3 font-semibold text-right">Total Amount</th>
                    <th className="pb-3 font-semibold text-center">Payment</th>
                    <th className="pb-3 font-semibold text-center">Fulfillment</th>
                    <th className="pb-3 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-pink/5 dark:divide-brand-dark/10 text-sm">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-brand-dark/15 transition-colors">
                      <td className="py-3.5 pl-2 font-semibold text-slate-800 dark:text-slate-200">
                        {order.orderId}
                      </td>
                      <td className="py-3.5 text-slate-500 dark:text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 text-slate-700 dark:text-slate-300">
                        <p className="font-semibold">{order.customerName}</p>
                        <p className="text-xs text-slate-400 font-normal">{order.customerContact}</p>
                      </td>
                      <td className="py-3.5 text-right text-slate-600 dark:text-slate-400 font-medium">
                        {order.products.reduce((sum, p) => sum + p.quantity, 0)} units
                      </td>
                      <td className="py-3.5 text-right font-semibold text-slate-800 dark:text-slate-200">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full
                          ${order.paymentStatus === 'Paid' ? 'bg-success/10 text-success' :
                            order.paymentStatus === 'Failed' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}
                        `}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full
                          ${order.orderStatus === 'Delivered' ? 'bg-success/10 text-success' :
                            order.orderStatus === 'Cancelled' ? 'bg-danger/10 text-danger' :
                              order.orderStatus === 'Shipped' ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600' : 'bg-warning/10 text-warning'}
                        `}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3.5 text-center">
                        <button
                          onClick={() => openDetailsModal(order)}
                          className="p-2 text-slate-400 hover:text-brand-rosegold hover:bg-brand-pink/10 rounded-lg transition-all"
                          title="View order details / update status"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
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
                  Showing page <span className="font-bold">{page}</span> of <span className="font-bold">{pages}</span> ({totalOrders} total orders)
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

      {/* Order Details & Status Changer Modal */}
      {isDetailsOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/20 dark:border-brand-darkBorder shadow-2xl overflow-hidden animate-scale-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-brand-pink/10 dark:border-brand-darkBorder">
              <div>
                <span className="text-xs font-bold text-brand-rosegold dark:text-brand-pink uppercase tracking-wider">Transaction Receipt</span>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 font-headings mt-0.5">
                  Order Details — {selectedOrder.orderId}
                </h3>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-brand-dark"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[520px] overflow-y-auto space-y-6">
              {/* Customer and Shipping Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-brand-dark/20 p-4 rounded-2xl border border-slate-100 dark:border-brand-darkBorder/50 text-xs">
                <div className="space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-1">Customer Info</h4>
                  <p><span className="text-slate-400">Full Name:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedOrder.customerName}</span></p>
                  <p><span className="text-slate-400">Contact No:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedOrder.customerContact}</span></p>
                  <p><span className="text-slate-400">Order Date:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{new Date(selectedOrder.createdAt).toLocaleString()}</span></p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-1">Delivery Info</h4>
                  <p><span className="text-slate-400">Shipping Address:</span></p>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 leading-relaxed pl-2 border-l-2 border-brand-pink">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {/* Purchased Products Subtable */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Itemized List</h4>
                <div className="overflow-x-auto border border-brand-pink/10 dark:border-brand-darkBorder rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-brand-dark/40 border-b border-brand-pink/10 dark:border-brand-darkBorder text-slate-400 font-bold uppercase">
                        <th className="p-3">Product Name</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-right">Quantity</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-pink/5 dark:divide-brand-dark/10 text-slate-700 dark:text-slate-300">
                      {selectedOrder.products.map((item, index) => (
                        <tr key={index}>
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{item.name}</td>
                          <td className="p-3 text-right">${item.price.toFixed(2)}</td>
                          <td className="p-3 text-right">{item.quantity}</td>
                          <td className="p-3 text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="bg-brand-pink/5 dark:bg-brand-dark/10 font-semibold border-t border-brand-pink/10 dark:border-brand-darkBorder">
                        <td colSpan="3" className="p-3 text-right uppercase text-slate-500">Order Total Amount:</td>
                        <td className="p-3 text-right text-sm font-bold text-brand-rosegold dark:text-brand-pink">
                          ${selectedOrder.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status Manager Control Form */}
              <form onSubmit={handleUpdateStatus} className="p-4 rounded-2xl border border-brand-pink/20 dark:border-brand-darkBorder bg-brand-pink/5 dark:bg-brand-dark/10">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                  Update Order States (Fulfillment &amp; Payment)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fulfillment Status Select */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Fulfillment Status</label>
                    <select
                      value={orderStatusVal}
                      onChange={(e) => setOrderStatusVal(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-white dark:bg-brand-dark text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  {/* Payment Status Select */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Payment Status</label>
                    <select
                      value={paymentStatusVal}
                      onChange={(e) => setPaymentStatusVal(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-white dark:bg-brand-dark text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-pink/20"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>

                {/* Cancel Warning Alert */}
                {orderStatusVal === 'Cancelled' && selectedOrder.orderStatus !== 'Cancelled' && (
                  <div className="mt-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-[11px] leading-normal flex items-center">
                    ⚠️ Note: transition to &apos;Cancelled&apos; will automatically restore the purchased quantities back to the product database stock.
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateLoading || (orderStatusVal === selectedOrder.orderStatus && paymentStatusVal === selectedOrder.paymentStatus)}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-brand-rosegold text-white hover:bg-brand-rosegold/95 shadow-md shadow-brand-rosegold/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    {updateLoading ? 'Updating order...' : 'Apply Status Updates'}
                  </button>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-6 py-4 border-t border-brand-pink/10 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/25">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-white hover:bg-slate-700 focus:outline-none"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
