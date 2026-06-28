import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiShoppingBag, FiGrid, FiUsers, FiDollarSign, 
  FiAlertTriangle, FiArrowUpRight, FiArrowDownRight, 
  FiClock, FiTrendingUp, FiActivity 
} from 'react-icons/fi';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, BarChart, Bar, 
  PieChart, Pie, Cell 
} from 'recharts';
import * as analyticsService from '../services/analyticsService';

const DashboardOverview = () => {
  const [kpis, setKpis] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [trendType, setTrendType] = useState('monthly'); // 'daily', 'weekly', 'monthly'
  const [trendData, setTrendData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOverviewData = async () => {
      setLoading(true);
      try {
        // Fetch overview statistics
        const overview = await analyticsService.getOverviewData();
        setKpis(overview.kpis);
        setRecentOrders(overview.recentOrders);

        // Fetch best sellers and category distribution
        const [prodPerf, revDist] = await Promise.all([
          analyticsService.getProductPerformance(),
          analyticsService.getRevenueDistribution()
        ]);
        setTopProducts(prodPerf);
        setPieData(revDist);

      } catch (err) {
        console.error('Error loading dashboard overview:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOverviewData();
  }, []);

  // Fetch sales trend when trendType toggles
  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const data = await analyticsService.getSalesTrend(trendType);
        setTrendData(data);
      } catch (err) {
        console.error('Error loading sales trend:', err.message);
      }
    };

    fetchTrend();
  }, [trendType]);

  // Color palette for Pie Chart (Jewelry themed)
  const PIE_COLORS = ['#B76E79', '#DCCEF9', '#F8D7E6', '#D4AF37'];

  if (loading || !kpis) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Header Skeleton */}
        <div className="h-10 w-48 bg-slate-200 dark:bg-brand-darkBorder rounded-lg animate-pulse" />

        {/* KPI Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 dark:bg-brand-darkBorder rounded-2xl animate-pulse" />
          ))}
        </div>

        {/* Charts Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-96 lg:col-span-2 bg-slate-200 dark:bg-brand-darkBorder rounded-2xl animate-pulse" />
          <div className="h-96 bg-slate-200 dark:bg-brand-darkBorder rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const kpiList = [
    {
      title: 'Total Products',
      value: kpis.totalProducts,
      growth: `${kpis.totalProducts > 0 ? '+8.5%' : '0%'}`,
      growthType: 'up',
      icon: <FiGrid className="w-6 h-6" />,
      color: 'bg-brand-pink/35 text-brand-rosegold',
      link: '/products'
    },
    {
      title: 'Total Orders',
      value: kpis.totalOrders,
      growth: `${kpis.salesGrowth >= 0 ? '+' : ''}${kpis.salesGrowth.toFixed(1)}%`,
      growthType: kpis.salesGrowth >= 0 ? 'up' : 'down',
      icon: <FiShoppingBag className="w-6 h-6" />,
      color: 'bg-brand-lavender/40 text-slate-700 dark:text-brand-pink',
      link: '/orders'
    },
    {
      title: 'Total Customers',
      value: kpis.totalCustomers,
      growth: `+${kpis.customerGrowth.toFixed(1)}%`,
      growthType: 'up',
      icon: <FiUsers className="w-6 h-6" />,
      color: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600',
      link: '/customers'
    },
    {
      title: 'Monthly Revenue',
      value: `$${kpis.monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      growth: `${kpis.revenueGrowth >= 0 ? '+' : ''}${kpis.revenueGrowth.toFixed(1)}%`,
      growthType: kpis.revenueGrowth >= 0 ? 'up' : 'down',
      icon: <FiDollarSign className="w-6 h-6" />,
      color: 'bg-amber-100 dark:bg-amber-950/30 text-amber-600',
      link: '/reports'
    },
    {
      title: 'Monthly Sales',
      value: kpis.monthlySales,
      growth: `${kpis.salesGrowth >= 0 ? '+' : ''}${kpis.salesGrowth.toFixed(1)}%`,
      growthType: kpis.salesGrowth >= 0 ? 'up' : 'down',
      icon: <FiActivity className="w-6 h-6" />,
      color: 'bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600',
      link: '/orders'
    },
    {
      title: 'Low Stock Items',
      value: kpis.lowStockItems,
      growth: kpis.lowStockItems > 0 ? 'Action required' : 'Inventory healthy',
      growthType: kpis.lowStockItems > 0 ? 'warn' : 'neutral',
      icon: <FiAlertTriangle className="w-6 h-6" />,
      color: kpis.lowStockItems > 0 ? 'bg-danger/10 text-danger animate-pulse' : 'bg-success/10 text-success',
      link: '/inventory'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-headings">Dashboard Overview</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome to Beads & Bracelets Boutique business center</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/orders')}
            className="flex items-center px-4 py-2 text-xs font-semibold rounded-xl border border-brand-pink/30 dark:border-brand-darkBorder bg-white dark:bg-brand-darkSecondary text-brand-rosegold dark:text-brand-pink hover:bg-brand-pink/10 transition-colors"
          >
            <FiClock className="mr-2 w-4 h-4" /> View Operations
          </button>
          <button 
            onClick={() => navigate('/reports')}
            className="flex items-center px-4 py-2 text-xs font-semibold rounded-xl bg-brand-rosegold text-white hover:bg-brand-rosegold/95 transition-all shadow-sm"
          >
            <FiTrendingUp className="mr-2 w-4 h-4" /> Generate Report
          </button>
        </div>
      </div>

      {/* Hero Jewelry Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ minHeight: '220px' }}>
        <img
          src="/hero_bracelets.png"
          alt="Handmade bead bracelets collection"
          className="w-full h-56 object-cover object-center"
          style={{ minHeight: '220px' }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center pl-8 pr-4 sm:pl-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-pink/90 mb-2">
            ✦ New Collection Available
          </span>
          <h3 className="text-2xl sm:text-3xl font-bold text-white font-headings leading-tight drop-shadow-lg">
            Handcrafted with Love
          </h3>
          <p className="mt-2 text-sm text-white/80 max-w-sm">
            Explore our latest beaded bracelets, earrings & custom jewelry pieces.
          </p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 self-start px-5 py-2.5 rounded-xl bg-brand-rosegold text-white text-xs font-bold shadow-lg hover:bg-white hover:text-brand-rosegold transition-all duration-200"
          >
            Browse Products →
          </button>
        </div>
      </div>

      {/* Category Showcase Cards */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">Product Categories</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Handmade Bracelets', img: '/hero_bracelets.png', link: '/products', badge: 'Bestseller' },
            { label: 'Fashion Earrings', img: '/earrings_collection.png', link: '/products', badge: 'Trending' },
            { label: 'Bead Collections', img: '/beads_variety.png', link: '/inventory', badge: 'In Stock' },
            { label: 'Custom & Gift Sets', img: '/custom_jewelry.png', link: '/products', badge: 'New Arrivals' },
          ].map((cat) => (
            <div
              key={cat.label}
              onClick={() => navigate(cat.link)}
              className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-sm border border-brand-pink/10 dark:border-brand-darkBorder hover:shadow-xl transition-all duration-300"
              style={{ minHeight: '150px' }}
            >
              <img
                src={cat.img}
                alt={cat.label}
                className="w-full h-40 object-cover object-center group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <span className="block text-xs font-bold text-white truncate">{cat.label}</span>
                <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-rosegold/80 text-white">
                  {cat.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick-Stats Ticker Strip ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-brand-pink/20 dark:border-brand-darkBorder"
        style={{ background: 'linear-gradient(135deg, #B76E79 0%, #D4AF37 50%, #DCCEF9 100%)' }}
      >
        <div className="flex items-center divide-x divide-white/20">
          {[
            { emoji: '💍', label: 'Best Category', value: 'Bracelets', sub: 'Highest revenue' },
            { emoji: '📦', label: 'In Stock Today', value: `${kpis.totalProducts - kpis.lowStockItems} items`, sub: 'Ready to ship' },
            { emoji: '⚡', label: 'Avg Order Value', value: `$${(kpis.monthlyRevenue / (kpis.monthlySales || 1)).toFixed(2)}`, sub: 'This month' },
            { emoji: '✨', label: 'New Collection', value: 'Now Live', sub: 'Earrings & Gifts' },
          ].map((stat, i) => (
            <div key={i} className="flex-1 flex items-center space-x-3 px-5 py-4">
              <span className="text-2xl flex-shrink-0 animate-float" style={{ animationDelay: `${i * 0.3}s` }}>
                {stat.emoji}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">{stat.label}</p>
                <p className="text-sm font-black text-white leading-tight truncate">{stat.value}</p>
                <p className="text-[10px] text-white/60">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiList.map((kpi, index) => (
          <div 
            key={index}
            onClick={() => navigate(kpi.link)}
            className="p-6 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder hover:shadow-lg transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-sans">
                {kpi.title}
              </span>
              <div className={`p-3 rounded-xl transition-colors duration-200 ${kpi.color}`}>
                {kpi.icon}
              </div>
            </div>
            
            <div className="mt-4 flex items-baseline justify-between">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-headings tracking-tight">
                {kpi.value}
              </h3>
              
              {/* Growth Badge */}
              <div className={`flex items-center text-xs font-bold rounded-lg px-2 py-1
                ${kpi.growthType === 'up' ? 'text-success bg-success/10' :
                  kpi.growthType === 'down' ? 'text-danger bg-danger/10' :
                  kpi.growthType === 'warn' ? 'text-warning bg-warning/10' : 'text-slate-500 bg-slate-100 dark:bg-brand-dark/40'}
              `}>
                {kpi.growthType === 'up' && <FiArrowUpRight className="mr-1 w-3.5 h-3.5" />}
                {kpi.growthType === 'down' && <FiArrowDownRight className="mr-1 w-3.5 h-3.5" />}
                <span>{kpi.growth}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Trend Line Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder lg:col-span-2 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-headings">Sales Trend</h3>
              <p className="text-xs text-slate-400">Monitor daily, weekly or monthly revenue curves</p>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex p-1 bg-slate-100 dark:bg-brand-dark rounded-xl">
              {['daily', 'weekly', 'monthly'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTrendType(type)}
                  className={`px-3 py-1.5 text-xs font-semibold capitalize rounded-lg transition-all duration-200
                    ${trendType === type 
                      ? 'bg-white dark:bg-brand-darkSecondary text-brand-rosegold dark:text-brand-pink shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}
                  `}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-brand-dark" />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid rgba(183, 110, 121, 0.2)', 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#1E293B' }}
                />
                <Legend iconType="circle" fontSize={12} wrapperStyle={{ paddingTop: '15px' }} />
                <Line 
                  type="monotone" 
                  name="Revenue ($)" 
                  dataKey="revenue" 
                  stroke="#B76E79" 
                  strokeWidth={3} 
                  dot={{ r: 4, strokeWidth: 1 }}
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  name="Orders Count" 
                  dataKey="sales" 
                  stroke="#A68BE6" 
                  strokeWidth={2.5} 
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Distribution Pie Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm">
          <div className="mb-6">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-headings">Revenue Share</h3>
            <p className="text-xs text-slate-400">Breakdown of sales by product category</p>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-sm text-slate-400">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Custom Pie Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                <span className="text-slate-600 dark:text-slate-400 truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Recent Orders Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder xl:col-span-2 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-headings">Recent Orders</h3>
              <p className="text-xs text-slate-400">List of latest customer transactions</p>
            </div>
            <button 
              onClick={() => navigate('/orders')}
              className="text-xs font-bold text-brand-rosegold dark:text-brand-pink hover:underline"
            >
              View All Orders
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-pink/10 dark:border-brand-darkBorder text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Order ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Items Count</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-pink/5 dark:divide-brand-dark/20 text-sm">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400">No orders logged yet</td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr 
                      key={order._id}
                      onClick={() => navigate(`/orders?search=${order.orderId}`)}
                      className="hover:bg-slate-50/50 dark:hover:bg-brand-dark/20 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 font-semibold text-slate-800 dark:text-slate-300 group-hover:text-brand-rosegold dark:group-hover:text-brand-pink">
                        {order.orderId}
                      </td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-400">
                        {order.customerName}
                      </td>
                      <td className="py-3.5 text-slate-600 dark:text-slate-400">
                        {order.products.reduce((sum, p) => sum + p.quantity, 0)} item(s)
                      </td>
                      <td className="py-3.5 text-right font-semibold text-slate-800 dark:text-slate-300">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full
                          ${order.orderStatus === 'Delivered' ? 'bg-success/10 text-success' : 
                            order.orderStatus === 'Cancelled' ? 'bg-danger/10 text-danger' : 
                            order.orderStatus === 'Shipped' ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600' : 'bg-warning/10 text-warning'}
                        `}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performing Products list */}
        <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-headings">Best Sellers</h3>
            <p className="text-xs text-slate-400">Top jewelry items by quantity sold</p>
          </div>

          {/* Jewelry Showcase Mini Thumbnail */}
          <div className="rounded-xl overflow-hidden mb-4">
            <img
              src="/custom_jewelry.png"
              alt="Custom jewelry gift sets"
              className="w-full h-28 object-cover object-center"
            />
          </div>

          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No product data available</p>
            ) : (
              topProducts.map((p, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-brand-dark/20 transition-colors">
                  <div className="flex items-center min-w-0 mr-4">
                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg bg-brand-pink/30 dark:bg-brand-rosegold/20 text-brand-rosegold dark:text-brand-pink text-xs font-bold">
                      #{index + 1}
                    </div>
                    <div className="ml-3 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{p.name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{p.quantity} units sold</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-brand-rosegold dark:text-brand-pink flex-shrink-0">
                    ${p.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
