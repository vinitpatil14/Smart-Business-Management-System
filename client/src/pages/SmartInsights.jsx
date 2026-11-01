import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  Clock,
  Copy,
  Check,
  Send,
  Boxes,
  Flame,
  Archive,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';

const SmartInsights = () => {
  const [activeTab, setActiveTab] = useState('predictions'); // 'predictions', 'insights', 'reminders'
  const [predictions, setPredictions] = useState(null);
  const [insights, setInsights] = useState(null);
  const [reminders, setReminders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const fetchSmartData = async () => {
    setLoading(true);
    try {
      const [predRes, insRes, remRes] = await Promise.all([
        api.get('/smart/low-stock-prediction'),
        api.get('/smart/product-insights'),
        api.get('/smart/payment-reminders')
      ]);

      if (predRes.data.success) setPredictions(predRes.data.data);
      if (insRes.data.success) setInsights(insRes.data.data);
      if (remRes.data.success) setReminders(remRes.data.data);
    } catch (err) {
      console.error('Failed to load smart insights', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSmartData();
  }, []);

  const handleCopyMessage = (id, message) => {
    navigator.clipboard.writeText(message);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'OUT_OF_STOCK':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
            OUT OF STOCK
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-900">
            CRITICAL (&lt;3 Days)
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-900">
            HIGH (3-7 Days)
          </span>
        );
      case 'MODERATE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            MODERATE (7-14 Days)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            SAFE (15+ Days)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Smart Business Engine</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Predictive stockout analysis, catalog profitability metrics & automated credit payment reminders
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-xl flex items-center text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('predictions')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeTab === 'predictions'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Stockout Predictor
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeTab === 'insights'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Velocity & Dead Stock
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeTab === 'reminders'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Payment Reminders
            </button>
          </div>

          <button
            onClick={fetchSmartData}
            disabled={loading}
            className="p-2 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. LOW STOCK PREDICTION ENGINE */}
      {activeTab === 'predictions' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">
                  Smart Demand Burn-Rate Algorithm
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Estimates when each SKU will run out of stock based on weighted 14-day sales velocity and recommends reorders.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="font-mono font-bold text-rose-600 text-base block">
                {predictions?.criticalCount || 0}
              </span>
              <span className="text-[11px] text-gray-400">Urgent Reorder SKUs</span>
            </div>
          </div>

          {/* Predictions Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-900/40 text-gray-500 uppercase font-semibold">
                    <th className="py-3 px-4">Product SKU</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4 text-center">14-Day Sales</th>
                    <th className="py-3 px-4 text-center">Burn Rate (Units/Day)</th>
                    <th className="py-3 px-4 text-center">Days Remaining</th>
                    <th className="py-3 px-4 text-center">Risk Assessment</th>
                    <th className="py-3 px-4 text-right">Recommended Reorder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 font-mono">
                  {predictions?.predictions?.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4 font-sans">
                        <span className="font-semibold text-gray-900 dark:text-white block">{item.name}</span>
                        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">{item.sku}</span>
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span className={item.stockQuantity <= item.reorderLevel ? 'text-rose-600' : 'text-gray-800 dark:text-gray-200'}>
                          {item.stockQuantity} {item.unit}
                        </span>
                        <span className="text-[10px] text-gray-400 block font-normal">reorder: {item.reorderLevel}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-gray-700 dark:text-gray-300">
                        {item.soldLast14Days}
                      </td>
                      <td className="py-3 px-4 text-center text-indigo-600 dark:text-indigo-400 font-bold">
                        {item.dailyBurnRate}
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        <span className={item.daysRemaining <= 3 ? 'text-rose-600 text-sm' : item.daysRemaining <= 7 ? 'text-amber-600' : 'text-gray-600 dark:text-gray-300'}>
                          {item.daysRemaining} days
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-sans">
                        {getRiskBadge(item.riskLevel)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-600 dark:text-indigo-400">
                        {item.recommendedReorder > 0 ? (
                          <span className="bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                            +{item.recommendedReorder} {item.unit}
                          </span>
                        ) : (
                          <span className="text-gray-400 font-normal">Adequate</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRODUCT VELOCITY & DEAD STOCK */}
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Velocity & High Margin */}
          <div className="space-y-6">
            {/* Top Performers */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Best Performers (Sales Volume)</span>
              </h3>
              <div className="divide-y divide-gray-100 dark:divide-slate-700 text-xs">
                {insights?.topPerformers?.map((p, i) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white block">{p.name}</span>
                      <span className="text-[11px] text-gray-400 font-mono">{p.sku} • ₹{p.sellingPrice}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 block">{p.unitsSold} units</span>
                      <span className="text-[11px] text-gray-400">₹{p.totalRevenue?.toFixed(2)} rev</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* High Margin Contributors */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-indigo-500" />
                <span>Highest Profit Margin % Items</span>
              </h3>
              <div className="divide-y divide-gray-100 dark:divide-slate-700 text-xs">
                {insights?.highMarginProducts?.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white block">{p.name}</span>
                      <span className="text-[11px] text-gray-400 font-mono">Cost: ₹{p.purchasePrice} | Retail: ₹{p.sellingPrice}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-emerald-600 block">{p.marginPercent}% margin</span>
                      <span className="text-[11px] text-gray-400">₹{p.unitMargin?.toFixed(2)}/unit</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dead Stock / Slow Movers */}
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Archive className="w-4 h-4 text-amber-500" />
                  <span>Dead Stock & Slow Movers</span>
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  {insights?.deadStockCount || 0} Dormant Items
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Products with inventory sitting on shelves with zero sales in the past 30 days. Recommend clearance discounts or promotional bundling.
              </p>

              <div className="divide-y divide-gray-100 dark:divide-slate-700 text-xs">
                {insights?.deadStock?.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">No dead stock detected! All catalog items are moving.</p>
                ) : (
                  insights?.deadStock?.map((p) => (
                    <div key={p.id} className="py-3 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white block">{p.name}</span>
                        <span className="text-[11px] text-gray-400 font-mono">SKU: {p.sku} • {p.category}</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="font-bold text-rose-600 block">{p.stockQuantity} idle units</span>
                        <span className="text-[11px] text-gray-400">Tied capital: ₹{(p.stockQuantity * p.purchasePrice).toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. AUTOMATED PAYMENT REMINDERS */}
      {activeTab === 'reminders' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Total Overdue Credit Receivables
              </span>
              <span className="text-2xl font-bold font-mono text-rose-600 mt-1 block">
                ₹{(reminders?.totalOutstanding || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-gray-500">
                {reminders?.totalCustomers || 0} customers with active credit balances
              </span>
            </div>

            <p className="text-xs text-gray-400 max-w-sm">
              Use the one-click reminder generator to copy personalized, polite collection messages ready to dispatch via WhatsApp, SMS, or Email.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reminders?.reminders?.map((r) => (
              <div
                key={r.customerId}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-4 text-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{r.name}</h4>
                      <p className="text-gray-500 font-mono">{r.phone || 'No phone provided'}</p>
                    </div>

                    <div className="text-right font-mono">
                      <span className="font-bold text-rose-600 text-sm block">
                        ₹{r.outstandingBalance?.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {r.daysOverdue} days overdue
                      </span>
                    </div>
                  </div>

                  {/* Pre-generated Message Box */}
                  <div className="mt-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-900 text-gray-700 dark:text-gray-300 font-sans text-xs italic border border-gray-200/60 dark:border-slate-800">
                    "{r.reminderMessage}"
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700/60">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      r.urgency === 'CRITICAL'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : r.urgency === 'HIGH'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {r.urgency} REMINDER
                  </span>

                  <button
                    onClick={() => handleCopyMessage(r.customerId, r.reminderMessage)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition shadow-sm"
                  >
                    {copiedId === r.customerId ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy WhatsApp Msg</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartInsights;
