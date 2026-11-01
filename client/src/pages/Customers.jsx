import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Award,
  Phone,
  Mail,
  MapPin,
  Clock,
  Eye,
  Edit,
  Trash2,
  Receipt
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    loyaltyPoints: '0',
    outstandingBalance: '0'
  });

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const loadCustomers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/customers', {
        params: { page, limit: 10, search }
      });
      if (res.data.success) {
        setCustomers(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers(1);
  }, [search]);

  const openAddCustomer = () => {
    setEditingCustomer(null);
    setCustomerForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      loyaltyPoints: '0',
      outstandingBalance: '0'
    });
    setIsCustomerModalOpen(true);
  };

  const openEditCustomer = (c) => {
    setEditingCustomer(c);
    setCustomerForm({
      name: c.name,
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      loyaltyPoints: c.loyaltyPoints,
      outstandingBalance: c.outstandingBalance
    });
    setIsCustomerModalOpen(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, customerForm);
      } else {
        await api.post('/customers', customerForm);
      }
      setIsCustomerModalOpen(false);
      loadCustomers(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Delete customer '${name}'?`)) return;
    try {
      await api.delete(`/customers/${id}`);
      loadCustomers(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete customer');
    }
  };

  const viewPurchaseHistory = async (id) => {
    setHistoryLoading(true);
    setHistoryModalOpen(true);
    try {
      const res = await api.get(`/customers/${id}`);
      if (res.data.success) {
        setSelectedCustomerHistory(res.data.data);
      }
    } catch (err) {
      alert('Failed to load purchase history');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Customer Management (CRM)</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Customer directory, loyalty points tracking, purchase history & outstanding dues
          </p>
        </div>

        <button
          onClick={openAddCustomer}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name, phone, or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-900/40 text-gray-500 dark:text-gray-400 uppercase font-semibold">
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4 text-center">Loyalty Points</th>
                <th className="py-3 px-4 text-right">Outstanding Due</th>
                <th className="py-3 px-4 text-center">Invoices</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No customers found matching search.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900 dark:text-white block">
                        {c.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{c.phone || 'No phone'}</span>
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{c.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {c.address || '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
                        <Award className="w-3 h-3" />
                        <span>{c.loyaltyPoints} pts</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={c.outstandingBalance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}>
                        ₹{c.outstandingBalance?.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className="text-gray-700 dark:text-gray-300 font-semibold">
                        {c._count?.sales || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => viewPurchaseHistory(c.id)}
                          className="p-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                          title="View Purchase History"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditCustomer(c)}
                          className="p-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                          title="Edit Customer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {canManage && (
                          <button
                            onClick={() => handleDeleteCustomer(c.id, c.name)}
                            className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

        <Pagination pagination={pagination} onPageChange={(p) => loadCustomers(p)} />
      </div>

      {/* Customer Add/Edit Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'Add New Customer'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Full Name / Business Name *
            </label>
            <input
              type="text"
              required
              value={customerForm.name}
              onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Delivery / Billing Address
            </label>
            <textarea
              rows={2}
              value={customerForm.address}
              onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Loyalty Points
              </label>
              <input
                type="number"
                value={customerForm.loyaltyPoints}
                onChange={(e) => setCustomerForm({ ...customerForm, loyaltyPoints: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Outstanding Balance (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={customerForm.outstandingBalance}
                onChange={(e) => setCustomerForm({ ...customerForm, outstandingBalance: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-slate-700">
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

      {/* Customer Purchase History Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={selectedCustomerHistory ? `${selectedCustomerHistory.name} - Purchase History` : 'History'}
        maxWidth="max-w-2xl"
      >
        {historyLoading ? (
          <div className="py-12 text-center text-gray-400">Loading purchase ledger...</div>
        ) : !selectedCustomerHistory ? (
          <div className="py-8 text-center text-gray-400">No records found.</div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Customer Summary Cards */}
            <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-slate-900/60 p-3 rounded-xl text-center">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Total Invoices</span>
                <span className="text-base font-bold text-gray-900 dark:text-white font-mono">
                  {selectedCustomerHistory.sales?.length || 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Loyalty Points</span>
                <span className="text-base font-bold text-amber-600 font-mono">
                  {selectedCustomerHistory.loyaltyPoints}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-semibold block">Balance Due</span>
                <span className="text-base font-bold text-rose-600 font-mono">
                  ₹{selectedCustomerHistory.outstandingBalance?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Invoices List */}
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {selectedCustomerHistory.sales?.length === 0 ? (
                <p className="py-6 text-center text-gray-400">No invoices on record for this customer.</p>
              ) : (
                selectedCustomerHistory.sales?.map((s) => (
                  <div key={s.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{s.invoiceNumber}</p>
                      <p className="text-[11px] text-gray-400">
                        {new Date(s.createdAt).toLocaleDateString()} • {s.items?.length || 0} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-gray-900 dark:text-white">
                        ₹{s.grandTotal?.toFixed(2)}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.2 rounded-full text-[10px] font-bold ${
                          s.paymentStatus === 'PAID'
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {s.paymentStatus} {s.balanceAmount > 0 && `(Due: ₹${s.balanceAmount})`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Customers;
