import React, { useState, useEffect } from 'react';
import { 
  FiBarChart2, FiTrendingUp, FiUsers, FiActivity, 
  FiInbox, FiArrowUpRight, FiArrowDownRight, FiPackage
} from 'react-icons/fi';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell,
  BarChart, Bar, RadialBarChart, RadialBar
} from 'recharts';
import * as analyticsService from '../services/analyticsService';

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-brand-darkSecondary border border-brand-pink/20 dark:border-brand-darkBorder rounded-xl shadow-xl px-4 py-3 text-xs">
        <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }} className="font-semibold">
            {p.name}: {prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, icon, colorClass, trend, trendVal }) => (
  <div className={`p-5 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-200`}>
    <div className="flex items-start justify-between">
      <div className={`p-2.5 rounded-xl ${colorClass}`}>{icon}</div>
      {trend && (
        <span className={`flex items-center text-[10px] font-bold rounded-lg px-2 py-1 ${trend === 'up' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
          {trend === 'up' ? <FiArrowUpRight className="mr-0.5 w-3 h-3" /> : <FiArrowDownRight className="mr-0.5 w-3 h-3" />}
          {trendVal}
        </span>
      )}
    </div>
    <p className="mt-4 text-2xl font-black text-slate-800 dark:text-slate-100 font-headings">{value}</p>
    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">{title}</p>
    {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
  </div>
);

// ─── Analytics Page ───────────────────────────────────────────────────────────
const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [barView, setBarView] = useState('top'); // 'top' | 'bottom'

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const advData = await analyticsService.getAdvancedAnalytics();
        setData(advData);
      } catch (err) {
        console.error('Error fetching advanced analytics:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const PIE_COLORS   = ['#B76E79', '#DCCEF9', '#D4AF37', '#22C55E'];
  const BAR_GRADIENT = ['#B76E79', '#DCCEF9'];

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading || !data) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="h-10 w-56 bg-slate-200 dark:bg-brand-darkBorder rounded-lg shimmer" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-brand-darkBorder rounded-2xl shimmer" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 lg:col-span-2 bg-slate-200 dark:bg-brand-darkBorder rounded-2xl shimmer" />
          <div className="h-80 bg-slate-200 dark:bg-brand-darkBorder rounded-2xl shimmer" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200 dark:bg-brand-darkBorder rounded-2xl shimmer" />
          <div className="h-72 bg-slate-200 dark:bg-brand-darkBorder rounded-2xl shimmer" />
        </div>
      </div>
    );
  }

  const totalRevenue = data.revenueGrowthTrend?.reduce((s, m) => s + m.revenue, 0) || 0;
  const latestMonth  = data.revenueGrowthTrend?.at(-1)?.revenue || 0;
  const prevMonth    = data.revenueGrowthTrend?.at(-2)?.revenue || 0;
  const revenueGrowth = prevMonth > 0 ? (((latestMonth - prevMonth) / prevMonth) * 100).toFixed(1) : '0.0';

  const barProducts = barView === 'top'
    ? [...(data.fastMoving || [])].sort((a, b) => b.sold - a.sold).slice(0, 6)
    : [...(data.slowMoving || [])].sort((a, b) => a.sold - b.sold).slice(0, 6);

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-headings">
            Advanced Analytics
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Deep-dive insights on revenue, products, customers &amp; inventory
          </p>
        </div>
        {/* Jewelry showcase badge */}
        <div className="relative rounded-2xl overflow-hidden w-48 h-16 flex-shrink-0 hidden md:block">
          <img src="/earrings_collection.png" alt="Collection" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-rosegold/70 to-transparent flex items-center pl-3">
            <span className="text-white text-xs font-bold leading-tight">Live<br/>Business Data</span>
          </div>
        </div>
      </div>

      {/* ── KPI Summary Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue (6m)"
          value={`$${(totalRevenue / 1000).toFixed(1)}k`}
          subtitle="Last 6 months combined"
          icon={<FiTrendingUp className="w-5 h-5" />}
          colorClass="bg-brand-pink/40 text-brand-rosegold"
          trend={parseFloat(revenueGrowth) >= 0 ? 'up' : 'down'}
          trendVal={`${revenueGrowth}%`}
        />
        <StatCard
          title="Customer Retention"
          value={`${data.customerRetentionRate}%`}
          subtitle="Returning buyers ratio"
          icon={<FiUsers className="w-5 h-5" />}
          colorClass="bg-brand-lavender/50 text-slate-600 dark:text-brand-pink"
          trend="up"
          trendVal={`+${data.customerRetentionRate > 50 ? (data.customerRetentionRate - 50).toFixed(0) : '2'}%`}
        />
        <StatCard
          title="Fast-Moving Items"
          value={data.fastMoving?.length || 0}
          subtitle="High-velocity products"
          icon={<FiActivity className="w-5 h-5" />}
          colorClass="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600"
          trend="up"
          trendVal="Active"
        />
        <StatCard
          title="Slow-Moving Items"
          value={data.slowMoving?.length || 0}
          subtitle="Needs promotion push"
          icon={<FiInbox className="w-5 h-5" />}
          colorClass="bg-amber-100 dark:bg-amber-950/30 text-amber-600"
          trend="down"
          trendVal="Review"
        />
      </div>

      {/* ── Revenue Trend + Customer Loyalty ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Growth Line Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder lg:col-span-2 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-headings">Revenue Growth Trend</h3>
              <p className="text-xs text-slate-400">Month-over-month performance (last 6 months)</p>
            </div>
            <span className={`text-sm font-black px-3 py-1.5 rounded-xl ${parseFloat(revenueGrowth) >= 0 ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
              {parseFloat(revenueGrowth) >= 0 ? '+' : ''}{revenueGrowth}%
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.revenueGrowthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip prefix="$" />} />
                <Legend iconType="circle" fontSize={11} wrapperStyle={{ paddingTop: 12 }} />
                <Line 
                  type="monotone" name="Monthly Revenue ($)" dataKey="revenue" 
                  stroke="#B76E79" strokeWidth={3} dot={{ r: 5, strokeWidth: 2, fill: '#fff', stroke: '#B76E79' }}
                  activeDot={{ r: 7 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Loyalty Pie + Stats */}
        <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-headings">Customer Loyalty</h3>
            <p className="text-xs text-slate-400">New vs returning buyers breakdown</p>
          </div>

          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.customerTypes}
                  cx="50%" cy="50%"
                  innerRadius={50} outerRadius={75}
                  paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.customerTypes.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={v => [v, 'Customers']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Retention Metric */}
          <div className="mt-auto pt-4 border-t border-brand-pink/10 dark:border-brand-darkBorder space-y-3">
            <div className="flex items-center justify-between text-xs mb-2">
              {data.customerTypes.map((ct, i) => (
                <div key={ct.name} className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                  <span className="text-slate-600 dark:text-slate-400">{ct.name}: <b>{ct.value}</b></span>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, rgba(183,110,121,0.12), rgba(212,175,55,0.08))' }}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-rosegold">Retention Rate</span>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1 font-headings">
                {data.customerRetentionRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Product Performance Bar Chart ────────────────────────────────── */}
      <div className="p-6 rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 font-headings">Product Performance</h3>
            <p className="text-xs text-slate-400">Units sold comparison across jewelry categories</p>
          </div>
          {/* Toggle top / bottom */}
          <div className="flex p-1 bg-slate-100 dark:bg-brand-dark rounded-xl self-start sm:self-auto">
            {[
              { key: 'top', label: '🏆 Top Sellers' },
              { key: 'bottom', label: '📦 Slow Movers' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setBarView(key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200
                  ${barView === key
                    ? 'bg-white dark:bg-brand-darkSecondary text-brand-rosegold dark:text-brand-pink shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={barProducts} 
              margin={{ top: 5, right: 10, left: -20, bottom: 40 }}
              barSize={28}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="name" 
                stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false}
                angle={-35} textAnchor="end" interval={0}
                tick={{ fill: '#94A3B8', fontSize: 10 }}
              />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="sold" 
                name="Units Sold"
                radius={[6, 6, 0, 0]}
                fill={barView === 'top' ? '#B76E79' : '#D4AF37'}
              >
                {barProducts.map((_, i) => (
                  <Cell 
                    key={i} 
                    fill={barView === 'top' 
                      ? `hsl(${350 - i * 8}, 45%, ${55 + i * 3}%)` 
                      : `hsl(43, ${60 - i * 5}%, ${50 + i * 3}%)`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Inventory Tables (Fast & Slow) ────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Fast Moving */}
        <div className="rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm overflow-hidden">
          {/* Header with image accent */}
          <div className="relative h-20 overflow-hidden">
            <img src="/beads_variety.png" alt="Fast moving" className="w-full h-full object-cover opacity-60 dark:opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/80 to-emerald-400/60 flex items-center px-5 space-x-3">
              <div className="p-2 bg-white/20 rounded-lg"><FiActivity className="w-5 h-5 text-white" /></div>
              <div>
                <h3 className="text-sm font-bold text-white font-headings">Fast Moving Inventory</h3>
                <p className="text-[10px] text-white/80">Highest sales turnover velocities</p>
              </div>
            </div>
          </div>

          <div className="p-5 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-pink/10 dark:border-brand-darkBorder font-bold uppercase text-slate-400 tracking-wider">
                  <th className="pb-3">SKU</th>
                  <th className="pb-3">Product</th>
                  <th className="pb-3 text-right">Sold</th>
                  <th className="pb-3 text-right">Stock</th>
                  <th className="pb-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-pink/5 dark:divide-brand-dark/20 text-slate-700 dark:text-slate-300">
                {(data.fastMoving || []).slice(0, 8).map((p) => (
                  <tr key={p.sku} className="hover:bg-slate-50/50 dark:hover:bg-brand-dark/20 transition-colors">
                    <td className="py-3 font-mono text-[10px] text-brand-rosegold font-semibold">{p.sku}</td>
                    <td className="py-3 font-semibold truncate max-w-[130px]">{p.name}</td>
                    <td className="py-3 text-right font-bold text-emerald-500">+{p.sold}</td>
                    <td className="py-3 text-right">{p.stock}</td>
                    <td className="py-3 text-right font-bold">${p.revenue.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slow Moving */}
        <div className="rounded-2xl bg-white dark:bg-brand-darkSecondary border border-brand-pink/10 dark:border-brand-darkBorder shadow-sm overflow-hidden">
          {/* Header with image accent */}
          <div className="relative h-20 overflow-hidden">
            <img src="/custom_jewelry.png" alt="Slow moving" className="w-full h-full object-cover opacity-60 dark:opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/80 to-amber-400/60 flex items-center px-5 space-x-3">
              <div className="p-2 bg-white/20 rounded-lg"><FiInbox className="w-5 h-5 text-white" /></div>
              <div>
                <h3 className="text-sm font-bold text-white font-headings">Slow Moving Inventory</h3>
                <p className="text-[10px] text-white/80">Items with low turnover rates</p>
              </div>
            </div>
          </div>

          <div className="p-5 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-pink/10 dark:border-brand-darkBorder font-bold uppercase text-slate-400 tracking-wider">
                  <th className="pb-3">SKU</th>
                  <th className="pb-3">Product</th>
                  <th className="pb-3 text-right">Sold</th>
                  <th className="pb-3 text-right">Stock</th>
                  <th className="pb-3 text-right">Capital</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-pink/5 dark:divide-brand-dark/20 text-slate-700 dark:text-slate-300">
                {(data.slowMoving || []).slice(0, 8).map((p) => (
                  <tr key={p.sku} className="hover:bg-slate-50/50 dark:hover:bg-brand-dark/20 transition-colors">
                    <td className="py-3 font-mono text-[10px] text-amber-500 font-semibold">{p.sku}</td>
                    <td className="py-3 font-semibold truncate max-w-[130px]">{p.name}</td>
                    <td className="py-3 text-right text-slate-400">{p.sold}</td>
                    <td className="py-3 text-right font-bold text-amber-500">{p.stock}</td>
                    <td className="py-3 text-right font-bold">${((p.stock * p.revenue / (p.sold || 1)) || 0).toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
