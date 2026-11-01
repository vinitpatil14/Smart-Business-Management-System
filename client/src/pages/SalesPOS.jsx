import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Receipt,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle,
  CreditCard,
  User,
  Tag,
  DollarSign,
  AlertCircle,
  ChevronRight,
  Filter
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import InvoiceModal from '../components/InvoiceModal';
import Pagination from '../components/Pagination';

const SalesPOS = () => {
  const [activeView, setActiveView] = useState('pos'); // 'pos' or 'invoices'

  // POS State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [taxPercent, setTaxPercent] = useState(18);
  const [paymentMode, setPaymentMode] = useState('CASH'); // CASH, UPI, CARD, CREDIT
  const [paidAmount, setPaidAmount] = useState('');
  const [saleNotes, setSaleNotes] = useState('');
  const [processingSale, setProcessingSale] = useState(false);

  // Invoices List State
  const [salesList, setSalesList] = useState([]);
  const [invoicesPagination, setInvoicesPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [activeInvoiceForPrint, setActiveInvoiceForPrint] = useState(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [settleInvoice, setSettleInvoice] = useState(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleMode, setSettleMode] = useState('UPI');

  // Quick Customer Create Modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', phone: '', email: '', address: '' });

  // Fetch initial POS data
  const loadPOSData = async () => {
    try {
      const [prodRes, catRes, custRes] = await Promise.all([
        api.get('/inventory/products', { params: { limit: 100 } }),
        api.get('/inventory/categories'),
        api.get('/customers/all-list')
      ]);

      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (catRes.data.success) setCategories(catRes.data.data);
      if (custRes.data.success) setCustomers(custRes.data.data);
    } catch (err) {
      console.error('Error loading POS data', err);
    }
  };

  const loadInvoices = async (page = 1) => {
    try {
      const res = await api.get('/sales', {
        params: {
          page,
          limit: 10,
          search: invoiceSearch,
          paymentStatus: statusFilter || undefined
        }
      });
      if (res.data.success) {
        setSalesList(res.data.data);
        setInvoicesPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Error loading invoices', err);
    }
  };

  useEffect(() => {
    loadPOSData();
  }, []);

  useEffect(() => {
    if (activeView === 'invoices') {
      loadInvoices(1);
    }
  }, [activeView, invoiceSearch, statusFilter]);

  // Cart operations
  const addToCart = (product) => {
    if (product.stockQuantity <= 0) {
      alert(`Product '${product.name}' is out of stock!`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          alert(`Cannot add more than available stock (${product.stockQuantity}) for ${product.name}`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          sku: product.sku,
          unit: product.unit,
          unitPrice: product.sellingPrice,
          stockQuantity: product.stockQuantity,
          quantity: 1,
          total: product.sellingPrice
        }
      ];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.stockQuantity) {
              alert(`Maximum available stock reached (${item.stockQuantity})`);
              return item;
            }
            if (newQty <= 0) return null;
            return { ...item, quantity: newQty, total: Math.round(newQty * item.unitPrice * 100) / 100 };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setSaleNotes('');
    setPaidAmount('');
  };

  // Cart Totals calculation
  const subtotal = cart.reduce((acc, it) => acc + it.total, 0);
  const discountVal = parseFloat(discount) || 0;
  const taxable = Math.max(0, subtotal - discountVal);
  const taxRate = parseFloat(taxPercent) || 0;
  const taxAmount = Math.round(taxable * (taxRate / 100) * 100) / 100;
  const grandTotal = Math.round((taxable + taxAmount) * 100) / 100;

  // Auto set paidAmount when cart grandTotal changes unless user typed custom
  const effectivePaidAmount = paidAmount !== '' ? parseFloat(paidAmount) || 0 : (paymentMode === 'CREDIT' ? 0 : grandTotal);
  const balanceDue = Math.max(0, Math.round((grandTotal - effectivePaidAmount) * 100) / 100);

  // Filtered products for POS grid
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.barcode && p.barcode.includes(productSearch));
    const matchesCat = selectedCategory ? p.categoryId === Number(selectedCategory) : true;
    return matchesSearch && matchesCat;
  });

  // Complete Sale
  const handleCompleteSale = async () => {
    if (cart.length === 0) {
      alert('Cart is empty. Add items to bill.');
      return;
    }

    if (paymentMode === 'CREDIT' && !selectedCustomerId) {
      alert('A registered customer must be selected for Credit / Outstanding sales.');
      return;
    }

    setProcessingSale(true);
    try {
      const payload = {
        customerId: selectedCustomerId || null,
        items: cart.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: it.unitPrice
        })),
        taxPercent: taxRate,
        discount: discountVal,
        paymentMode,
        paidAmount: effectivePaidAmount,
        notes: saleNotes
      };

      const res = await api.post('/sales', payload);
      if (res.data.success) {
        // Open Invoice preview
        setActiveInvoiceForPrint(res.data.data);
        setIsInvoiceModalOpen(true);
        // Refresh product stock in POS
        loadPOSData();
        clearCart();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process sale');
    } finally {
      setProcessingSale(false);
    }
  };

  // Quick Customer Creation
  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/customers', newCustomerForm);
      if (res.data.success) {
        setCustomers((prev) => [...prev, res.data.data]);
        setSelectedCustomerId(res.data.data.id);
        setIsCustomerModalOpen(false);
        setNewCustomerForm({ name: '', phone: '', email: '', address: '' });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add customer');
    }
  };

  // Settle Invoice Payment
  const handleOpenSettle = (sale) => {
    setSettleInvoice(sale);
    setSettleAmount(sale.balanceAmount);
    setSettleModalOpen(true);
  };

  const handleSettlePayment = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/sales/${settleInvoice.id}/payment`, {
        amount: settleAmount,
        paymentMode: settleMode,
        notes: 'Counter payment collection'
      });
      setSettleModalOpen(false);
      loadInvoices(invoicesPagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Payment settlement failed');
    }
  };

  const viewInvoiceDetail = async (id) => {
    try {
      const res = await api.get(`/sales/${id}`);
      if (res.data.success) {
        setActiveInvoiceForPrint(res.data.data);
        setIsInvoiceModalOpen(true);
      }
    } catch (err) {
      alert('Failed to load invoice details');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Sales & POS Billing</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Instant point of sale checkout, inventory auto-deduction, tax invoice generator
          </p>
        </div>

        <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-xl flex items-center text-xs font-semibold">
          <button
            onClick={() => setActiveView('pos')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeView === 'pos'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            POS Terminal
          </button>
          <button
            onClick={() => setActiveView('invoices')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeView === 'invoices'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Invoices History
          </button>
        </div>
      </div>

      {activeView === 'pos' ? (
        /* POS Split View: Catalog on Left, Billing Cart on Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Product Catalog (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Search and Category Pills */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Scan barcode, or search by product name / SKU..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1 rounded-lg whitespace-nowrap transition ${
                    selectedCategory === ''
                      ? 'bg-indigo-600 text-white font-medium shadow-sm'
                      : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                  }`}
                >
                  All Items
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(String(cat.id))}
                    className={`px-3 py-1 rounded-lg whitespace-nowrap transition ${
                      selectedCategory === String(cat.id)
                        ? 'bg-indigo-600 text-white font-medium shadow-sm'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const inStock = p.stockQuantity > 0;
                return (
                  <div
                    key={p.id}
                    onClick={() => inStock && addToCart(p)}
                    className={`p-3.5 rounded-2xl border transition-all text-xs flex flex-col justify-between ${
                      inStock
                        ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md cursor-pointer'
                        : 'bg-gray-100/60 dark:bg-slate-800/40 border-gray-200/50 dark:border-slate-800 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <span className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-tight">
                          {p.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono block truncate">
                        {p.sku}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm">
                        ₹{p.sellingPrice?.toFixed(2)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          inStock
                            ? p.stockQuantity <= p.reorderLevel
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {inStock ? `${p.stockQuantity} ${p.unit}` : 'Out'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Active Bill Cart (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header and Cart Clear */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-bold text-sm text-gray-900 dark:text-white">Active Order</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono">
                    {cart.reduce((a, b) => a + b.quantity, 0)} items
                  </span>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-500 hover:text-rose-600 font-semibold"
                  >
                    Clear Cart
                  </button>
                )}
              </div>

              {/* Customer Selector with quick add */}
              <div className="flex items-center gap-2 text-xs">
                <div className="relative flex-1">
                  <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Walk-in Retail Customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.phone ? `(${c.phone})` : ''} - pts: {c.loyaltyPoints}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(true)}
                  title="Add new customer"
                  className="p-1.5 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Cart Items List */}
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700/60 pr-1 text-xs">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No items added to current bill</p>
                    <p className="text-[11px] mt-0.5">Click product cards on the left to add</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.productId} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{item.name}</p>
                        <p className="text-[11px] text-gray-400 font-mono">
                          ₹{item.unitPrice} × {item.quantity} = ₹{item.total?.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateQuantity(item.productId, -1)}
                          className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-bold font-mono text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, 1)}
                          className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 text-gray-700 dark:text-gray-300 flex items-center justify-center font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1 text-gray-400 hover:text-rose-500 ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Billing Breakdown & Payment Controls */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-3 text-xs">
              {/* Discount & Tax Selectors */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-gray-500 mb-0.5">Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-0.5">GST Rate (%)</label>
                  <select
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(parseFloat(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs font-mono"
                  >
                    <option value="0">0% (Nil)</option>
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST</option>
                    <option value="28">28% GST</option>
                  </select>
                </div>
              </div>

              {/* Payment Mode Buttons */}
              <div>
                <label className="block text-[11px] text-gray-500 mb-1">Payment Mode</label>
                <div className="grid grid-cols-4 gap-1 text-[11px] font-semibold">
                  {['CASH', 'UPI', 'CARD', 'CREDIT'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setPaymentMode(mode);
                        if (mode === 'CREDIT') setPaidAmount('0');
                        else setPaidAmount('');
                      }}
                      className={`py-1.5 rounded-lg border transition ${
                        paymentMode === mode
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-sm'
                          : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Paid Amount Override (if partial payment) */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Amount Paid Now:</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder={String(grandTotal)}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-28 text-right px-2 py-1 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 font-mono font-semibold"
                />
              </div>

              {/* Totals Summary */}
              <div className="bg-gray-50 dark:bg-slate-900/60 p-3 rounded-xl space-y-1 font-mono text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {discountVal > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-₹{discountVal.toFixed(2)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>GST ({taxPercent}%):</span>
                    <span>+₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-gray-900 dark:text-white pt-1 border-t border-gray-200 dark:border-slate-700">
                  <span>Grand Total:</span>
                  <span className="text-indigo-600 dark:text-indigo-400">₹{grandTotal.toFixed(2)}</span>
                </div>
                {balanceDue > 0 && (
                  <div className="flex justify-between text-rose-500 font-bold pt-1">
                    <span>Balance Due:</span>
                    <span>₹{balanceDue.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Complete Sale CTA */}
              <button
                type="button"
                disabled={cart.length === 0 || processingSale}
                onClick={handleCompleteSale}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
              >
                {processingSale ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Complete Sale & Invoice (₹{grandTotal.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Invoices History Table View */
        <div className="space-y-4">
          {/* Search & Status Filters */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={invoiceSearch}
                onChange={(e) => setInvoiceSearch(e.target.value)}
                placeholder="Search invoices by invoice # or customer name..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="w-full sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Payment Statuses</option>
                <option value="PAID">PAID</option>
                <option value="PARTIAL">PARTIAL</option>
                <option value="DUE">DUE</option>
              </select>
            </div>
          </div>

          {/* Invoices List Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-900/40 text-gray-500 dark:text-gray-400 uppercase font-semibold">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-center">Items</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                  {salesList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        No sales or invoices found.
                      </td>
                    </tr>
                  ) : (
                    salesList.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {sale.invoiceNumber}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {sale.customer?.name || 'Walk-in Customer'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {sale._count?.items || 0}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                          ₹{sale.grandTotal?.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold">
                          <span className={sale.balanceAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'}>
                            ₹{sale.balanceAmount?.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sale.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : sale.paymentStatus === 'PARTIAL'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {sale.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => viewInvoiceDetail(sale.id)}
                              className="px-2.5 py-1 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium inline-flex items-center gap-1"
                              title="Print Invoice"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                            {sale.balanceAmount > 0 && (
                              <button
                                onClick={() => handleOpenSettle(sale)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium inline-flex items-center gap-1"
                              >
                                <span>Collect</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination pagination={invoicesPagination} onPageChange={(p) => loadInvoices(p)} />
          </div>
        </div>
      )}

      {/* Invoice Modal for Print / PDF */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        sale={activeInvoiceForPrint}
      />

      {/* Quick Customer Add Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Quick Register Customer"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Customer / Business Name *
            </label>
            <input
              type="text"
              required
              value={newCustomerForm.name}
              onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
              placeholder="e.g. Ramesh Traders"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Mobile Phone
            </label>
            <input
              type="text"
              value={newCustomerForm.phone}
              onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
              placeholder="e.g. 9811223344"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={newCustomerForm.email}
              onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
              placeholder="contact@business.com"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsCustomerModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>

      {/* Settle Balance Payment Modal */}
      <Modal
        isOpen={settleModalOpen}
        onClose={() => setSettleModalOpen(false)}
        title={`Collect Payment for ${settleInvoice?.invoiceNumber}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSettlePayment} className="space-y-4 text-xs">
          <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-xl">
            <p className="text-gray-500">Customer: <span className="font-semibold text-gray-900 dark:text-white">{settleInvoice?.customer?.name || 'Walk-in'}</span></p>
            <p className="text-gray-500 mt-1">Outstanding Balance: <span className="font-bold text-rose-600 font-mono">₹{settleInvoice?.balanceAmount?.toFixed(2)}</span></p>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Payment Amount to Collect (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              max={settleInvoice?.balanceAmount}
              value={settleAmount}
              onChange={(e) => setSettleAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Payment Mode
            </label>
            <select
              value={settleMode}
              onChange={(e) => setSettleMode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="UPI">UPI / QR Code</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setSettleModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
            >
              Record Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalesPOS;
