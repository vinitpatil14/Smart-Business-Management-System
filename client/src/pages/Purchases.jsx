import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  Trash2,
  DollarSign,
  PackagePlus,
  Building2,
  Edit
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';

const Purchases = () => {
  const [activeTab, setActiveTab] = useState('purchases'); // 'purchases' or 'suppliers'
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // New Purchase Modal State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseSupplierId, setPurchaseSupplierId] = useState('');
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [purchaseTax, setPurchaseTax] = useState(0);
  const [purchasePaid, setPurchasePaid] = useState('');
  const [purchaseNotes, setPurchaseNotes] = useState('');
  const [submittingPurchase, setSubmittingPurchase] = useState(false);

  // Supplier Add/Edit Modal
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
    balanceDue: '0'
  });

  // Supplier Payment Settle Modal
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [selectedPurchaseForSettle, setSelectedPurchaseForSettle] = useState(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNotes, setSettleNotes] = useState('');

  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const loadSuppliers = async () => {
    try {
      const res = await api.get('/purchases/suppliers');
      if (res.data.success) setSuppliers(res.data.data);
    } catch (err) {
      console.error('Failed to load suppliers', err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await api.get('/inventory/products', { params: { limit: 100 } });
      if (res.data.success) setProducts(res.data.data);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const loadPurchases = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/purchases', {
        params: { page, limit: 10, search }
      });
      if (res.data.success) {
        setPurchases(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load purchases', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
    loadProducts();
  }, []);

  useEffect(() => {
    if (activeTab === 'purchases') {
      loadPurchases(1);
    }
  }, [activeTab, search]);

  // Purchase Item Rows
  const addPurchaseItemRow = () => {
    if (products.length === 0) return;
    const defaultProduct = products[0];
    setPurchaseItems((prev) => [
      ...prev,
      {
        productId: defaultProduct.id,
        quantity: 10,
        unitPrice: defaultProduct.purchasePrice
      }
    ]);
  };

  const updatePurchaseItem = (index, field, value) => {
    setPurchaseItems((prev) => {
      const copy = [...prev];
      copy[index][field] = value;
      if (field === 'productId') {
        const prod = products.find((p) => p.id === Number(value));
        if (prod) copy[index].unitPrice = prod.purchasePrice;
      }
      return copy;
    });
  };

  const removePurchaseItem = (index) => {
    setPurchaseItems((prev) => prev.filter((_, i) => i !== index));
  };

  const openNewPurchaseModal = () => {
    setPurchaseSupplierId(suppliers[0]?.id || '');
    setPurchaseItems(
      products.length > 0
        ? [{ productId: products[0].id, quantity: 10, unitPrice: products[0].purchasePrice }]
        : []
    );
    setPurchaseTax(0);
    setPurchasePaid('');
    setPurchaseNotes('');
    setIsPurchaseModalOpen(true);
  };

  const purchaseSubtotal = purchaseItems.reduce(
    (acc, it) => acc + (parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice) || 0),
    0
  );
  const purchaseGrandTotal = purchaseSubtotal + (parseFloat(purchaseTax) || 0);

  const handleCreatePurchase = async (e) => {
    e.preventDefault();
    if (!purchaseSupplierId || purchaseItems.length === 0) {
      alert('Please select a supplier and add at least one item');
      return;
    }

    setSubmittingPurchase(true);
    try {
      const payload = {
        supplierId: purchaseSupplierId,
        items: purchaseItems.map((it) => ({
          productId: it.productId,
          quantity: parseInt(it.quantity),
          unitPrice: parseFloat(it.unitPrice)
        })),
        taxAmount: parseFloat(purchaseTax) || 0,
        paidAmount: purchasePaid !== '' ? parseFloat(purchasePaid) : purchaseGrandTotal,
        notes: purchaseNotes
      };

      const res = await api.post('/purchases', payload);
      if (res.data.success) {
        setIsPurchaseModalOpen(false);
        loadPurchases(1);
        loadSuppliers();
        loadProducts(); // Stock increased!
        alert('Purchase order created successfully! Product stock has been increased.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record purchase');
    } finally {
      setSubmittingPurchase(false);
    }
  };

  // Supplier modal handlers
  const openAddSupplier = () => {
    setEditingSupplier(null);
    setSupplierForm({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      gstNumber: '',
      balanceDue: '0'
    });
    setIsSupplierModalOpen(true);
  };

  const openEditSupplier = (sup) => {
    setEditingSupplier(sup);
    setSupplierForm({
      name: sup.name,
      contactPerson: sup.contactPerson || '',
      phone: sup.phone || '',
      email: sup.email || '',
      address: sup.address || '',
      gstNumber: sup.gstNumber || '',
      balanceDue: sup.balanceDue
    });
    setIsSupplierModalOpen(true);
  };

  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api.put(`/purchases/suppliers/${editingSupplier.id}`, supplierForm);
      } else {
        await api.post('/purchases/suppliers', supplierForm);
      }
      setIsSupplierModalOpen(false);
      loadSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save supplier');
    }
  };

  // Settle supplier payment
  const openSettleSupplier = (p) => {
    setSelectedPurchaseForSettle(p);
    setSettleAmount(p.balanceAmount);
    setSettleNotes('Supplier account settlement');
    setSettleModalOpen(true);
  };

  const handleSettleSupplierPayment = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/purchases/${selectedPurchaseForSettle.id}/payment`, {
        amount: settleAmount,
        notes: settleNotes
      });
      setSettleModalOpen(false);
      loadPurchases(pagination.page);
      loadSuppliers();
    } catch (err) {
      alert(err.response?.data?.message || 'Settlement failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Purchases & Suppliers</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Procurement management, supplier accounts & automated inventory restocking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'purchases'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Purchase Orders
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'suppliers'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Suppliers Directory
            </button>
          </div>

          {canManage && activeTab === 'purchases' && (
            <button
              onClick={openNewPurchaseModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <PackagePlus className="w-4 h-4" />
              <span>New Stock Purchase</span>
            </button>
          )}

          {canManage && activeTab === 'suppliers' && (
            <button
              onClick={openAddSupplier}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Supplier</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'purchases' ? (
        <>
          {/* Search Bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search purchase orders by PO # or supplier name..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Purchases Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-900/40 text-gray-500 dark:text-gray-400 uppercase font-semibold">
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4 text-center">Items</th>
                    <th className="py-3 px-4 text-right">Grand Total</th>
                    <th className="py-3 px-4 text-right">Balance Due</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    {canManage && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        No purchase records found.
                      </td>
                    </tr>
                  ) : (
                    purchases.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {p.purchaseNumber}
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          {p.supplier?.name}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {p._count?.items || 0}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                          ₹{p.grandTotal?.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold">
                          <span className={p.balanceAmount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-400'}>
                            ₹{p.balanceAmount?.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.paymentStatus === 'PAID'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : p.paymentStatus === 'PARTIAL'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {p.paymentStatus}
                          </span>
                        </td>
                        {canManage && (
                          <td className="py-3 px-4 text-right">
                            {p.balanceAmount > 0 && (
                              <button
                                onClick={() => openSettleSupplier(p)}
                                className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium hover:bg-indigo-100"
                              >
                                Settle Pay
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination pagination={pagination} onPageChange={(p) => loadPurchases(p)} />
          </div>
        </>
      ) : (
        /* Suppliers Tab */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div
              key={s.id}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  {canManage && (
                    <button
                      onClick={() => openEditSupplier(s)}
                      className="p-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white mt-3 text-sm">{s.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Contact: {s.contactPerson || 'N/A'} • {s.phone || 'No phone'}
                </p>
                {s.gstNumber && (
                  <p className="text-[11px] font-mono text-gray-400 mt-1">GSTIN: {s.gstNumber}</p>
                )}
                {s.address && (
                  <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{s.address}</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-gray-400 block">Balance Due:</span>
                  <span
                    className={`font-mono font-bold ${
                      s.balanceDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'
                    }`}
                  >
                    ₹{s.balanceDue?.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-gray-400 block">Orders:</span>
                  <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
                    {s._count?.purchases || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Purchase Modal */}
      <Modal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        title="Record New Stock Purchase Order"
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleCreatePurchase} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Select Supplier *
            </label>
            <select
              required
              value={purchaseSupplierId}
              onChange={(e) => setPurchaseSupplierId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">Select Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Due: ₹{s.balanceDue})
                </option>
              ))}
            </select>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-gray-700 dark:text-gray-300">
                Products to Purchase (Auto Stock Restock)
              </label>
              <button
                type="button"
                onClick={addPurchaseItemRow}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold inline-flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Add Product Row
              </button>
            </div>

            <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-slate-900/60 text-gray-500 border-b border-gray-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2 px-3">Product</th>
                    <th className="py-2 px-3 w-24">Qty</th>
                    <th className="py-2 px-3 w-32">Cost Price (₹)</th>
                    <th className="py-2 px-3 text-right">Line Total</th>
                    <th className="py-2 px-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {purchaseItems.map((item, index) => (
                    <tr key={index}>
                      <td className="p-2">
                        <select
                          value={item.productId}
                          onChange={(e) => updatePurchaseItem(index, 'productId', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Current Stock: {p.stockQuantity})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updatePurchaseItem(index, 'quantity', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => updatePurchaseItem(index, 'unitPrice', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                        />
                      </td>
                      <td className="p-2 text-right font-mono font-semibold">
                        ₹{((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0)).toFixed(2)}
                      </td>
                      <td className="p-2 text-center">
                        {purchaseItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePurchaseItem(index)}
                            className="text-gray-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Purchase Notes / Reference
              </label>
              <textarea
                rows={3}
                value={purchaseNotes}
                onChange={(e) => setPurchaseNotes(e.target.value)}
                placeholder="Supplier invoice reference, truck receipt #..."
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="bg-gray-50 dark:bg-slate-900/60 p-4 rounded-xl space-y-2 font-mono text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal:</span>
                <span>₹{purchaseSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-500">
                <span>Tax Amount (₹):</span>
                <input
                  type="number"
                  step="0.01"
                  value={purchaseTax}
                  onChange={(e) => setPurchaseTax(e.target.value)}
                  className="w-24 px-2 py-1 rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-right font-mono"
                />
              </div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-slate-700 pt-1 text-sm">
                <span>Grand Total:</span>
                <span className="text-indigo-600 dark:text-indigo-400">₹{purchaseGrandTotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-600 dark:text-gray-300">Paid Now (₹):</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder={String(purchaseGrandTotal)}
                  value={purchasePaid}
                  onChange={(e) => setPurchasePaid(e.target.value)}
                  className="w-28 px-2 py-1 rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-right font-mono font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsPurchaseModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingPurchase}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium shadow-sm"
            >
              {submittingPurchase ? 'Processing...' : 'Record Purchase & Restock'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Supplier Modal */}
      <Modal
        isOpen={isSupplierModalOpen}
        onClose={() => setIsSupplierModalOpen(false)}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Supplier / Company Name *
            </label>
            <input
              type="text"
              required
              value={supplierForm.name}
              onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Contact Person
            </label>
            <input
              type="text"
              value={supplierForm.contactPerson}
              onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                type="text"
                value={supplierForm.phone}
                onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">GSTIN</label>
              <input
                type="text"
                value={supplierForm.gstNumber}
                onChange={(e) => setSupplierForm({ ...supplierForm, gstNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={supplierForm.email}
              onChange={(e) => setSupplierForm({ ...supplierForm, email: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Address</label>
            <textarea
              rows={2}
              value={supplierForm.address}
              onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsSupplierModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm"
            >
              Save Supplier
            </button>
          </div>
        </form>
      </Modal>

      {/* Settle Supplier Dues Modal */}
      <Modal
        isOpen={settleModalOpen}
        onClose={() => setSettleModalOpen(false)}
        title={`Pay Supplier for ${selectedPurchaseForSettle?.purchaseNumber}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSettleSupplierPayment} className="space-y-4 text-xs">
          <div className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-xl">
            <p className="text-gray-500">Supplier: <span className="font-semibold text-gray-900 dark:text-white">{selectedPurchaseForSettle?.supplier?.name}</span></p>
            <p className="text-gray-500 mt-1">Remaining Balance: <span className="font-bold text-rose-600 font-mono">₹{selectedPurchaseForSettle?.balanceAmount?.toFixed(2)}</span></p>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Payment Amount (₹) *
            </label>
            <input
              type="number"
              step="0.01"
              required
              max={selectedPurchaseForSettle?.balanceAmount}
              value={settleAmount}
              onChange={(e) => setSettleAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Payment Note / Bank Reference
            </label>
            <input
              type="text"
              value={settleNotes}
              onChange={(e) => setSettleNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
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
              Confirm Supplier Payment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Purchases;
