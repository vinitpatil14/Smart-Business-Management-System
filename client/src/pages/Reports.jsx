import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Boxes,
  Users,
  Printer
} from 'lucide-react';
import api from '../services/api';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('sales'); // 'sales', 'pnl', 'stock', 'dues'
  const [salesReport, setSalesReport] = useState(null);
  const [pnlReport, setPnlReport] = useState(null);
  const [stockReport, setStockReport] = useState(null);
  const [duesReport, setDuesReport] = useState(null);
  const [salesPeriod, setSalesPeriod] = useState('monthly');
  const [loading, setLoading] = useState(false);

  const fetchSalesReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/sales', { params: { period: salesPeriod } });
      if (res.data.success) setSalesReport(res.data.data);
    } catch (err) {
      console.error('Failed to load sales report', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPnlReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/profit-loss');
      if (res.data.success) setPnlReport(res.data.data);
    } catch (err) {
      console.error('Failed to load P&L report', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/stock');
      if (res.data.success) setStockReport(res.data.data);
    } catch (err) {
      console.error('Failed to load stock report', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDuesReport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/customer-dues');
      if (res.data.success) setDuesReport(res.data.data);
    } catch (err) {
      console.error('Failed to load dues report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'sales') fetchSalesReport();
    else if (activeTab === 'pnl') fetchPnlReport();
    else if (activeTab === 'stock') fetchStockReport();
    else if (activeTab === 'dues') fetchDuesReport();
  }, [activeTab, salesPeriod]);

  // Export to CSV helper
  const handleExportCSV = async (type) => {
    try {
      const res = await api.get(`/reports/export/${type}`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sbms-${type}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export CSV report');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Reports, Profit & Loss and Analytics</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Audit sales statements, net profitability, inventory valuations and aging receivables
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-xl flex items-center text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setActiveTab('sales')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeTab === 'sales'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Sales
            </button>
            <button
              onClick={() => setActiveTab('pnl')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeTab === 'pnl'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Profit & Loss
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeTab === 'stock'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Stock Valuation
            </button>
            <button
              onClick={() => setActiveTab('dues')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeTab === 'dues'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Customer Dues
            </button>
          </div>

          <button
            onClick={() => {
              const exportType = activeTab === 'dues' ? 'customer-dues' : activeTab;
              handleExportCSV(exportType);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-xs font-medium text-gray-700 dark:text-gray-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* 1. SALES REPORT */}
      {activeTab === 'sales' && (
        <div className="space-y-4">
          {/* Period Filter */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Timeframe:</span>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-900 p-1 rounded-xl text-xs">
                {['daily', 'weekly', 'monthly', 'yearly'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setSalesPeriod(p)}
                    className={`px-3 py-1 rounded-lg capitalize transition ${
                      salesPeriod === p
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-sm'
                        : 'text-gray-500'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-gray-400">
              {salesReport?.summary?.orderCount || 0} bills in period
            </span>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">Gross Sales Total</span>
              <span className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1 block">
                ₹{(salesReport?.summary?.totalSales || 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">GST Tax Collected</span>
              <span className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-1 block">
                ₹{(salesReport?.summary?.totalTax || 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">Discounts Granted</span>
              <span className="text-xl font-bold font-mono text-emerald-600 mt-1 block">
                ₹{(salesReport?.summary?.totalDiscount || 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">Uncollected Credit</span>
              <span className="text-xl font-bold font-mono text-rose-600 mt-1 block">
                ₹{(salesReport?.summary?.totalBalance || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Invoices List in Period */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-900/40 text-gray-500 uppercase font-semibold">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-right">Subtotal</th>
                    <th className="py-3 px-4 text-right">Tax</th>
                    <th className="py-3 px-4 text-right">Discount</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 font-mono">
                  {salesReport?.sales?.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4 font-bold text-indigo-600 dark:text-indigo-400">{s.invoiceNumber}</td>
                      <td className="py-3 px-4 text-gray-500 font-sans">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-sans font-medium text-gray-900 dark:text-white">{s.customer?.name || 'Walk-in'}</td>
                      <td className="py-3 px-4 text-right">₹{s.subtotal?.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-gray-500">₹{s.taxAmount?.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-emerald-600">₹{s.discount?.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">₹{s.grandTotal?.toFixed(2)}</td>
                      <td className="py-3 px-4 text-center font-sans">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700">
                          {s.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROFIT & LOSS STATEMENT */}
      {activeTab === 'pnl' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm max-w-4xl mx-auto space-y-6 text-xs">
            <div className="border-b border-gray-200 dark:border-slate-700 pb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Income Statement (Profit & Loss)
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Period: {new Date(pnlReport?.startDate).toLocaleDateString()} to {new Date(pnlReport?.endDate).toLocaleDateString()}
              </p>
            </div>

            {/* Income Statement Sections */}
            <div className="space-y-4">
              {/* Revenue */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-white">
                  <span>1. Gross Sales Revenue</span>
                  <span className="font-mono">₹{pnlReport?.revenue?.grossSales?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 pl-4 font-mono">
                  <span>Net Item Subtotal:</span>
                  <span>₹{pnlReport?.revenue?.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 pl-4 font-mono">
                  <span>Tax Collected:</span>
                  <span>₹{pnlReport?.revenue?.taxCollected?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 pl-4 font-mono">
                  <span>Discounts Granted:</span>
                  <span>-₹{pnlReport?.revenue?.totalDiscounts?.toFixed(2)}</span>
                </div>
              </div>

              {/* COGS */}
              <div className="space-y-1.5 pt-2 border-t border-gray-100 dark:border-slate-700">
                <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-white">
                  <span>2. Cost of Goods Sold (COGS)</span>
                  <span className="font-mono text-rose-600">-₹{pnlReport?.costOfGoodsSold?.toFixed(2)}</span>
                </div>
                <p className="text-gray-400 pl-4 text-[11px]">
                  Purchase cost valuation of all products sold in period
                </p>
              </div>

              {/* Gross Profit */}
              <div className="flex justify-between font-bold text-sm bg-indigo-50 dark:bg-indigo-950/50 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                <span>Gross Profit (Margin: {pnlReport?.grossMarginPercent}%)</span>
                <span className="font-mono text-base">₹{pnlReport?.grossProfit?.toFixed(2)}</span>
              </div>

              {/* Operating Expenses */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                <div className="flex justify-between font-bold text-sm text-gray-900 dark:text-white">
                  <span>3. Operating Overhead Expenses</span>
                  <span className="font-mono text-rose-600">-₹{pnlReport?.operatingExpenses?.total?.toFixed(2)}</span>
                </div>

                <div className="pl-4 space-y-1 text-gray-500 font-mono">
                  {Object.entries(pnlReport?.operatingExpenses?.breakdown || {}).map(([cat, amount]) => (
                    <div key={cat} className="flex justify-between">
                      <span className="capitalize">{cat.toLowerCase()}:</span>
                      <span>₹{amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Net Profit */}
              <div className="flex justify-between items-center font-bold text-base bg-emerald-50 dark:bg-emerald-950/60 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200">
                <div>
                  <span className="block">Net Business Profit</span>
                  <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">
                    Net Margin: {pnlReport?.netMarginPercent}%
                  </span>
                </div>
                <span className="font-mono text-xl">₹{pnlReport?.netProfit?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. STOCK VALUATION REPORT */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">Total Inventory Units</span>
              <span className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-1 block">
                {stockReport?.totalStockUnits?.toLocaleString()}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">Valuation (At Cost Price)</span>
              <span className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1 block">
                ₹{stockReport?.totalValuationCost?.toLocaleString()}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">Valuation (At Retail Price)</span>
              <span className="text-xl font-bold font-mono text-emerald-600 mt-1 block">
                ₹{stockReport?.totalValuationRetail?.toLocaleString()}
              </span>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
              <span className="text-[11px] font-semibold text-gray-400 uppercase">Potential Gross Margin</span>
              <span className="text-xl font-bold font-mono text-purple-600 mt-1 block">
                ₹{stockReport?.potentialProfit?.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Stock Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-900/40 text-gray-500 uppercase font-semibold">
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Stock Qty</th>
                    <th className="py-3 px-4 text-right">Cost Price</th>
                    <th className="py-3 px-4 text-right">Retail Price</th>
                    <th className="py-3 px-4 text-right">Total Cost Val</th>
                    <th className="py-3 px-4 text-right">Total Retail Val</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60 font-mono">
                  {stockReport?.products?.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4 font-sans font-semibold text-gray-900 dark:text-white">{p.name}</td>
                      <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400">{p.sku}</td>
                      <td className="py-3 px-4 font-sans text-gray-500">{p.category}</td>
                      <td className="py-3 px-4 text-center font-bold">{p.stockQuantity} {p.unit}</td>
                      <td className="py-3 px-4 text-right">₹{p.purchasePrice?.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900 dark:text-white">₹{p.sellingPrice?.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-300">₹{p.stockValuationCost?.toFixed(2)}</td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">₹{p.stockValuationRetail?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. CUSTOMER DUES REPORT */}
      {activeTab === 'dues' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
                Total Outstanding Receivables
              </span>
              <span className="text-2xl font-bold font-mono text-rose-600 mt-1 block">
                ₹{(duesReport?.totalReceivables || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-gray-500">
                Owed across {duesReport?.customerCount || 0} commercial credit accounts
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-900/40 text-gray-500 uppercase font-semibold">
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4 text-center">Pending Bills</th>
                    <th className="py-3 px-4 text-right">Total Outstanding Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                  {duesReport?.customers?.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">{c.name}</td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-mono">{c.phone || '—'}</td>
                      <td className="py-3 px-4 text-gray-500">{c.email || '—'}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-amber-600">{c.pendingInvoicesCount}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-rose-600 text-sm">
                        ₹{c.outstandingBalance?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
