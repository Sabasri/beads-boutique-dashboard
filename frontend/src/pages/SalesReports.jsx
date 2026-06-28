import React, { useState, useEffect } from 'react';
import { 
  FiFileText, FiCalendar, FiDollarSign, FiShoppingBag, 
  FiTrendingUp, FiDownload, FiPrinter, FiLoader, FiAlertCircle 
} from 'react-icons/fi';
import * as orderService from '../services/orderService';

const SalesReports = () => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Date states (default to last 30 days)
  const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(now.toISOString().split('T')[0]);
  const [reportOrders, setReportOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch report data
  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all orders in the date range
      // To bypass pagination, we request a high limit (e.g. 500)
      const data = await orderService.getOrders({
        limit: 500
      });

      // Filter by date range on the client side to ensure accuracy across MongoDB/JSON modes
      const filtered = (data.orders || []).filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate >= startDate && orderDate <= endDate && order.orderStatus !== 'Cancelled';
      });

      // Sort chronologically
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      setReportOrders(filtered);
    } catch (err) {
      setError('Failed to compile sales report. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Run on mount
  useEffect(() => {
    generateReport();
  }, []);

  // Quick Date presets
  const applyPreset = (preset) => {
    const today = new Date();
    let start = new Date();
    let end = today;

    switch (preset) {
      case 'daily':
        start = today;
        break;
      case 'weekly':
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'annual':
        start = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  // Calculate report metrics
  const totalRevenue = reportOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = reportOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalUnitsSold = reportOrders.reduce((sum, o) => {
    return sum + o.products.reduce((s, p) => s + p.quantity, 0);
  }, 0);

  // EXPORT 1: NATIVE CSV EXPORT
  const exportToCSV = () => {
    if (reportOrders.length === 0) return;

    const headers = ['Order ID,Date,Customer Name,Items Count,Total Amount,Payment Status,Fulfillment Status\n'];
    const rows = reportOrders.map(o => {
      const date = new Date(o.createdAt).toLocaleDateString();
      const itemsCount = o.products.reduce((s, p) => s + p.quantity, 0);
      return `${o.orderId},${date},"${o.customerName.replace(/"/g, '""')}",${itemsCount},${o.totalAmount.toFixed(2)},${o.paymentStatus},${o.orderStatus}\n`;
    });

    const csvContent = headers.concat(rows).join('');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Beads_Bracelets_Sales_Report_${startDate}_to_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // EXPORT 2: EXCEL (CSV formatting suited for Excel auto-open)
  const exportToExcel = () => {
    if (reportOrders.length === 0) return;
    
    // Excel enjoys a BOM character at the start to parse UTF-8 correctly
    const BOM = '\uFEFF';
    const headers = ['Order ID\tDate\tCustomer Name\tItems Count\tRevenue Amount\tPayment Status\tOrder Status\n'];
    const rows = reportOrders.map(o => {
      const date = new Date(o.createdAt).toLocaleDateString();
      const itemsCount = o.products.reduce((s, p) => s + p.quantity, 0);
      return `${o.orderId}\t${date}\t${o.customerName}\t${itemsCount}\t$${o.totalAmount.toFixed(2)}\t${o.paymentStatus}\t${o.orderStatus}\n`;
    });

    const excelContent = BOM + headers.concat(rows).join('');
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Beads_Bracelets_Sales_Report_${startDate}_to_${endDate}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // EXPORT 3: NATIVE PDF VIA PRINTER DIALOG
  const exportToPDF = () => {
    if (reportOrders.length === 0) return;

    // Create a new window containing a clean, print-styled document representation
    const printWindow = window.open('', '_blank');
    const dateRangeStr = `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;

    const itemsHTML = reportOrders.map(o => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 8px; font-family: monospace;">${o.orderId}</td>
        <td style="padding: 8px;">${new Date(o.createdAt).toLocaleDateString()}</td>
        <td style="padding: 8px;">${o.customerName}</td>
        <td style="padding: 8px; text-align: right;">${o.products.reduce((s, p) => s + p.quantity, 0)}</td>
        <td style="padding: 8px; text-align: right; font-weight: bold;">$${o.totalAmount.toFixed(2)}</td>
        <td style="padding: 8px; text-align: center;">${o.orderStatus}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Beads & Bracelets Boutique - Sales Report</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 20px; }
            h1 { font-family: Georgia, serif; color: #B76E79; border-bottom: 2px solid #F8D7E6; padding-bottom: 10px; }
            .meta { font-size: 12px; color: #666; margin-bottom: 20px; }
            .kpis { display: flex; justify-content: space-between; margin-bottom: 30px; background: #FFF9F5; padding: 15px; border-radius: 8px; border: 1px solid #F8D7E6; }
            .kpi { text-align: center; flex: 1; }
            .kpi-val { font-size: 20px; font-weight: bold; color: #B76E79; margin-top: 5px; }
            table { w-width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; width: 100%; }
            th { background: #F8D7E6; color: #B76E79; padding: 10px; text-align: left; }
          </style>
        </head>
        <body>
          <h1>Beads & Bracelets Boutique</h1>
          <div class="meta">
            <strong>Sales Performance Report</strong><br/>
            Date Range: ${dateRangeStr}<br/>
            Report Compiled: ${new Date().toLocaleString()}
          </div>
          
          <div class="kpis">
            <div class="kpi"><div>Total Revenue</div><div class="kpi-val">$${totalRevenue.toFixed(2)}</div></div>
            <div class="kpi"><div>Total Orders</div><div class="kpi-val">${totalOrders}</div></div>
            <div class="kpi"><div>Avg Order Value</div><div class="kpi-val">$${avgOrderValue.toFixed(2)}</div></div>
            <div class="kpi"><div>Units Sold</div><div class="kpi-val">${totalUnitsSold}</div></div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th style="text-align: right;">Items</th>
                <th style="text-align: right;">Amount</th>
                <th style="text-align: center;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <script>
            window.onload = function() {
              window.print();
              window.close();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-headings">Sales Reports</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Generate, review, and export high-fidelity financial sales records</p>
      </div>

      {/* Date Filters Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Start Date</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/20 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">End Date</label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-brand-darkBorder bg-slate-50 dark:bg-brand-dark/20 text-slate-800 dark:text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={generateReport}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-brand-rosegold text-white hover:bg-brand-rosegold/95 transition-all shadow-sm flex items-center md:mb-0.5"
            >
              {loading ? <FiLoader className="mr-2 w-4 h-4 animate-spin" /> : <FiFileText className="mr-2 w-4.5 h-4.5" />}
              Compile Report
            </button>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { applyPreset('daily'); generateReport(); }} className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-brand-dark hover:bg-brand-pink/20 dark:hover:bg-brand-darkBorder text-slate-600 dark:text-slate-300">Daily</button>
            <button onClick={() => { applyPreset('weekly'); generateReport(); }} className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-brand-dark hover:bg-brand-pink/20 dark:hover:bg-brand-darkBorder text-slate-600 dark:text-slate-300">Weekly</button>
            <button onClick={() => { applyPreset('monthly'); generateReport(); }} className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-brand-dark hover:bg-brand-pink/20 dark:hover:bg-brand-darkBorder text-slate-600 dark:text-slate-300">Monthly</button>
            <button onClick={() => { applyPreset('annual'); generateReport(); }} className="px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-brand-dark hover:bg-brand-pink/20 dark:hover:bg-brand-darkBorder text-slate-600 dark:text-slate-300">Annual</button>
          </div>
        </div>
      </div>

      {/* KPI Reports Board */}
      {reportOrders.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
          {/* Revenue */}
          <div className="p-5 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Revenue</span>
            <div className="flex items-baseline space-x-1.5 mt-2">
              <FiDollarSign className="text-brand-rosegold w-4.5 h-4.5" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-headings">
                {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>

          {/* Sales Count */}
          <div className="p-5 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Orders Fulfillments</span>
            <div className="flex items-baseline space-x-1.5 mt-2">
              <FiShoppingBag className="text-indigo-500 w-4.5 h-4.5" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-headings">{totalOrders}</h3>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="p-5 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Average Order Value</span>
            <div className="flex items-baseline space-x-1.5 mt-2">
              <FiTrendingUp className="text-emerald-500 w-4.5 h-4.5" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-headings">${avgOrderValue.toFixed(2)}</h3>
            </div>
          </div>

          {/* Units Sold */}
          <div className="p-5 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Units Sold</span>
            <div className="flex items-baseline space-x-1.5 mt-2">
              <FiFileText className="text-amber-500 w-4.5 h-4.5" />
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-headings">{totalUnitsSold} units</h3>
            </div>
          </div>
        </div>
      )}

      {/* Compiled Datatable Panel */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm">
        
        {/* Table Header with Exports */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-brand-pink/10 dark:border-brand-darkBorder mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-headings">Report Transaction log</h3>
            <p className="text-xs text-slate-400">List of orders included in this performance sheet</p>
          </div>
          
          {reportOrders.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={exportToCSV}
                className="flex items-center px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-brand-darkBorder text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-brand-dark"
              >
                <FiDownload className="mr-1.5 w-3.5 h-3.5" /> CSV
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-brand-darkBorder text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-brand-dark"
              >
                <FiDownload className="mr-1.5 w-3.5 h-3.5" /> Excel
              </button>
              <button
                onClick={exportToPDF}
                className="flex items-center px-3 py-2 text-xs font-semibold rounded-xl bg-brand-rosegold text-white hover:bg-brand-rosegold/95 transition-all shadow-sm"
              >
                <FiPrinter className="mr-1.5 w-3.5 h-3.5" /> Print / PDF
              </button>
            </div>
          )}
        </div>

        {/* Datatable */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-4 py-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-100 dark:bg-brand-dark/30 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : reportOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 dark:text-slate-500">
              <FiFileText className="w-12 h-12 mb-4 stroke-1" />
              <h4 className="text-base font-semibold text-slate-600 dark:text-slate-400">No orders found in range</h4>
              <p className="text-xs mt-1">Select a different range to compile a sales performance report</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-pink/10 dark:border-brand-darkBorder text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-2 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Fulfillment Date</th>
                  <th className="pb-3 font-semibold">Customer Name</th>
                  <th className="pb-3 font-semibold text-right">Items Purchased</th>
                  <th className="pb-3 font-semibold text-right">Receipt Amount</th>
                  <th className="pb-3 font-semibold text-center">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-pink/5 dark:divide-brand-dark/10 text-sm">
                {reportOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/50 dark:hover:bg-brand-dark/15 transition-colors">
                    <td className="py-3.5 pl-2 font-semibold text-slate-800 dark:text-slate-200">{o.orderId}</td>
                    <td className="py-3.5 text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 text-slate-700 dark:text-slate-300 font-semibold">{o.customerName}</td>
                    <td className="py-3.5 text-right font-medium text-slate-600 dark:text-slate-400">
                      {o.products.reduce((s, p) => s + p.quantity, 0)} units
                    </td>
                    <td className="py-3.5 text-right font-bold text-slate-800 dark:text-slate-200">
                      ${o.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full
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
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReports;
