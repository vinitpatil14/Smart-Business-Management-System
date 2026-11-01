import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Clock,
  Package,
  Users,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Database,
  CheckCircle2
} from 'lucide-react';
import { seedInitialFirestoreData } from '../services/firestoreService';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncingFirestore, setSyncingFirestore] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSyncToFirestore = async () => {
    try {
      setSyncingFirestore(true);
      setSyncStatus(null);
      const res = await seedInitialFirestoreData();
      setSyncStatus({ success: true, message: res.message });
      setTimeout(() => setSyncStatus(null), 5000);
    } catch (err) {
      console.error(err);
      setSyncStatus({ success: false, message: 'Sync failed: ' + (err.message || 'Check connection') });
      setTimeout(() => setSyncStatus(null), 5000);
    } finally {
      setSyncingFirestore(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const [sumRes, chartRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/dashboard/charts')
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.data);
      if (chartRes.data.success) setCharts(chartRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500">Loading business analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
            Business Executive Overview
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Real-time telemetry, revenue figures, inventory health & operations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Firestore Cloud Sync Button */}
          <button
            onClick={handleSyncToFirestore}
            disabled={syncingFirestore}
            title="Upload initial demo products and customers directly to your Cloud Firestore database"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300/80 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-xs font-semibold text-amber-800 dark:text-amber-300 transition"
          >
            <Database className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${syncingFirestore ? 'animate-bounce' : ''}`} />
            <span>{syncingFirestore ? 'Syncing...' : 'Sync to Firestore'}</span>
          </button>

          <button
            onClick={fetchDashboardData}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-xs font-medium text-gray-600 dark:text-gray-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => navigate('/sales')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>New POS Bill</span>
          </button>
        </div>
      </div>

      {syncStatus && (
        <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
          syncStatus.success 
            ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        }`}>
          {syncStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
          <span>{syncStatus.message}</span>
        </div>
      )}

      {/* 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Today's Sales
            </span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white mt-1 block">
              ₹{(summary?.todaySalesAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {summary?.todaySalesCount || 0} bills completed today
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Monthly Revenue
            </span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white mt-1 block">
              ₹{(summary?.monthlyRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              {summary?.monthlySalesCount || 0} orders this month
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Estimated Profit */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Estimated Net Profit
            </span>
            <span className={`text-2xl font-bold mt-1 block ${
              (summary?.estimatedProfit || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              ₹{(summary?.estimatedProfit || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              After COGS & ₹{(summary?.monthlyExpenses || 0).toLocaleString()} expenses
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Customer Dues */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Customer Dues
            </span>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 block">
              ₹{(summary?.pendingPaymentsTotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              {summary?.pendingCustomersCount || 0} customers with balance
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Low-stock & Smart Notice Alert bar if any */}
      {summary?.lowStockCount > 0 && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold">Attention: {summary.lowStockCount} items are running below reorder level.</span>
              <span className="hidden sm:inline text-amber-700 dark:text-amber-300 ml-1">
                Use our Smart Inventory Prediction to see burn rates and stockout timelines.
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/smart-insights')}
            className="inline-flex items-center gap-1 font-bold text-amber-900 dark:text-amber-100 underline hover:opacity-80 ml-2"
          >
            <span>View Insights</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Daily Sales Trend (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Daily Sales Trend (Past 14 Days)
              </h3>
              <p className="text-xs text-gray-400">Total daily invoice billing value</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              Line Chart
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.salesTrend || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val) => [`₹${val}`, 'Daily Sales']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Sales by Category */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Sales by Category
              </h3>
              <p className="text-xs text-gray-400">Category revenue distribution</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
              Pie Chart
            </span>
          </div>

          <div className="h-56 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.categoryBreakdown || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {(charts?.categoryBreakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`₹${val}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-slate-700 text-[11px]">
            {(charts?.categoryBreakdown || []).map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="text-gray-600 dark:text-gray-300 truncate">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar Chart: Revenue vs Expenses (Past 6 Months) */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Revenue vs Operating Expenses (Past 6 Months)
            </h3>
            <p className="text-xs text-gray-400">Cash generation vs overhead costs</p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
            Bar Chart
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts?.revenueVsExpenses || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(val, name) => [`₹${val}`, name === 'revenue' ? 'Sales Revenue' : 'Operating Expenses']}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(val) => <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{val === 'revenue' ? 'Revenue' : 'Expenses'}</span>}
              />
              <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Grid: Top Selling Products & Low Stock Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top-Selling Products */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Top-Selling Fast Movers</span>
            </h3>
            <button
              onClick={() => navigate('/inventory')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              All Products
            </button>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-slate-700/60">
            {summary?.topSellingProducts?.length > 0 ? (
              summary.topSellingProducts.map((p, index) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-slate-700 font-mono font-bold text-gray-500 flex items-center justify-center text-[11px]">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-[11px] text-gray-400">{p.category} • {p.sku}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block font-mono">
                      {p.unitsSold} units
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      ₹{p.totalSales?.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">No sales data recorded yet.</p>
            )}
          </div>
        </div>

        {/* Low-Stock Critical Watchlist */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Low-Stock Reorder Watchlist</span>
            </h3>
            <button
              onClick={() => navigate('/purchases')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Create Purchase
            </button>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-slate-700/60">
            {summary?.lowStockList?.length > 0 ? (
              summary.lowStockList.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                    <p className="text-[11px] text-gray-400 font-mono">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                      {item.stockQuantity} left (min {item.reorderLevel})
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 py-4 text-center font-medium">
                All inventory items are well-stocked above reorder thresholds!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
