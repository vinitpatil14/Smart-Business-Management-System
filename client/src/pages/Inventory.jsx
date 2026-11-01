import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  FolderPlus,
  CheckCircle,
  Tag,
  Archive,
  RotateCcw,
  Info,
  ShieldCheck,
  X
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import { useAuth } from '../context/AuthContext';

const Inventory = () => {
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'categories', 'archived'
  const [products, setProducts] = useState([]);
  const [archivedProducts, setArchivedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [archivedPagination, setArchivedPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [loading, setLoading] = useState(false);

  // Notifications
  const [toast, setToast] = useState(null); // { type: 'success' | 'info' | 'error', message: string }

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    purchasePrice: '',
    sellingPrice: '',
    stockQuantity: '',
    reorderLevel: '10',
    unit: 'pcs'
  });

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/inventory/categories');
      if (res.data.success) setCategories(res.data.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/products', {
        params: {
          page,
          limit: 10,
          search,
          categoryId: selectedCategory || undefined,
          lowStockOnly: lowStockFilter,
          showArchived: false
        }
      });
      if (res.data.success) {
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedProducts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/inventory/products', {
        params: {
          page,
          limit: 10,
          search,
          showArchived: true
        }
      });
      if (res.data.success) {
        setArchivedProducts(res.data.data);
        setArchivedPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load archived products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts(1);
    } else if (activeTab === 'archived') {
      fetchArchivedProducts(1);
    }
  }, [activeTab, search, selectedCategory, lowStockFilter]);

  // Product Modal Handlers
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      sku: '',
      barcode: '',
      categoryId: categories[0]?.id || '',
      purchasePrice: '',
      sellingPrice: '',
      stockQuantity: '0',
      reorderLevel: '10',
      unit: 'pcs'
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      sku: prod.sku,
      barcode: prod.barcode || '',
      categoryId: prod.categoryId,
      purchasePrice: prod.purchasePrice,
      sellingPrice: prod.sellingPrice,
      stockQuantity: prod.stockQuantity,
      reorderLevel: prod.reorderLevel,
      unit: prod.unit
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/inventory/products/${editingProduct.id}`, productForm);
        showToast(`Product '${productForm.name}' updated successfully!`);
      } else {
        await api.post('/inventory/products', productForm);
        showToast(`Product '${productForm.name}' created successfully!`);
      }
      setIsProductModalOpen(false);
      fetchProducts(pagination.page);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save product', 'error');
    }
  };

  // Safe Deletion with Custom Modal
  const promptDeleteProduct = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const confirmDeleteProduct = async (force = false) => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/inventory/products/${productToDelete.id}`, {
        params: { force }
      });
      setDeleteModalOpen(false);
      showToast(res.data.message || 'Product removed successfully!');
      fetchProducts(pagination.page);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove product', 'error');
    } finally {
      setIsDeleting(false);
      setProductToDelete(null);
    }
  };

  const handleRestoreProduct = async (id, name) => {
    try {
      const res = await api.post(`/inventory/products/${id}/restore`);
      showToast(`Product '${name}' restored to active catalog!`);
      fetchArchivedProducts(archivedPagination.page);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to restore product', 'error');
    }
  };

  // Category Modal Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '' });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, description: cat.description || '' });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/inventory/categories/${editingCategory.id}`, categoryForm);
        showToast(`Category '${categoryForm.name}' updated!`);
      } else {
        await api.post('/inventory/categories', categoryForm);
        showToast(`Category '${categoryForm.name}' created!`);
      }
      setIsCategoryModalOpen(false);
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category '${name}'? Products attached will block deletion.`)) return;
    try {
      await api.delete(`/inventory/categories/${id}`);
      showToast(`Category '${name}' deleted!`);
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl text-xs font-medium shadow-lg transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
            toast.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
              : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header and Tab switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Inventory Management</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Track product catalog, stock levels, barcodes, cost and selling prices
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab buttons */}
          <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'products'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Active Catalog
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'categories'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'archived'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Archived Items
            </button>
          </div>

          {canManage && activeTab === 'products' && (
            <button
              onClick={handleOpenAddProduct}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}

          {canManage && activeTab === 'categories' && (
            <button
              onClick={handleOpenAddCategory}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Category</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'products' && (
        <>
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, SKU, or barcode..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category filter */}
            <div className="w-full md:w-56">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Low stock toggle */}
            <button
              onClick={() => setLowStockFilter(!lowStockFilter)}
              className={`w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-medium transition ${
                lowStockFilter
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 font-semibold'
                  : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Low-Stock Only</span>
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-900/40 text-gray-500 dark:text-gray-400 uppercase font-semibold">
                    <th className="py-3 px-4">Product Details</th>
                    <th className="py-3 px-4">SKU & Barcode</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Cost Price</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-4 text-center">Stock</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    {canManage && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        Loading products...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-400">
                        No products found matching your search.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => {
                      const isLow = p.stockQuantity <= p.reorderLevel;
                      const isOut = p.stockQuantity <= 0;

                      return (
                        <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-900 dark:text-white block">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-gray-400">Unit: {p.unit}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px]">
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium block">
                              {p.sku}
                            </span>
                            {p.barcode && <span className="text-gray-400">{p.barcode}</span>}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                            {p.category?.name || 'Uncategorized'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono text-gray-500">
                            ₹{p.purchasePrice?.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-gray-900 dark:text-white">
                            ₹{p.sellingPrice?.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-bold">
                            <span className={isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-gray-800 dark:text-gray-200'}>
                              {p.stockQuantity}
                            </span>
                            <span className="text-[10px] text-gray-400 block font-normal">
                              reorder: {p.reorderLevel}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {isOut ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                                Out of Stock
                              </span>
                            ) : isLow ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                Low Stock
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                                In Stock
                              </span>
                            )}
                          </td>
                          {canManage && (
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleOpenEditProduct(p)}
                                  className="p-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                                  title="Edit Product"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                {user?.role === 'ADMIN' && (
                                  <button
                                    onClick={() => promptDeleteProduct(p)}
                                    className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Pagination pagination={pagination} onPageChange={(newPage) => fetchProducts(newPage)} />
          </div>
        </>
      )}

      {/* Archived Products Tab */}
      {activeTab === 'archived' && (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
            <div className="flex items-center gap-2.5">
              <Archive className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                Archived products are hidden from your active inventory catalog and POS terminal, while preserving all historical sales invoices and accounting reports.
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-900/40 text-gray-500 dark:text-gray-400 uppercase font-semibold">
                    <th className="py-3 px-4">Product</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-4 text-center">Remaining Stock</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                  {archivedProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No archived products found.
                      </td>
                    </tr>
                  ) : (
                    archivedProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30">
                        <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          {p.name}
                        </td>
                        <td className="py-3 px-4 font-mono text-gray-400">{p.sku}</td>
                        <td className="py-3 px-4 text-gray-500">{p.category?.name}</td>
                        <td className="py-3 px-4 text-right font-mono">₹{p.sellingPrice?.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center font-mono">{p.stockQuantity} {p.unit}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleRestoreProduct(p.id, p.name)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold hover:bg-emerald-100"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore to Active</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination pagination={archivedPagination} onPageChange={(p) => fetchArchivedProducts(p)} />
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <Tag className="w-4 h-4" />
                  </div>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCategory(c)}
                        className="p-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => handleDeleteCategory(c.id, c.name)}
                          className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-gray-900 dark:text-white mt-3 text-sm">{c.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {c.description || 'No description provided'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-gray-400">Products assigned</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  {c._count?.products || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete / Archive Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Remove Product"
        maxWidth="max-w-md"
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                Remove '{productToDelete?.name}'?
              </p>
              <p className="mt-1 text-gray-600 dark:text-gray-300 leading-relaxed">
                If this product has historical sales invoices or purchase records, NexPulse will <strong>safely archive</strong> it.
                This keeps your sales history, tax audit invoices, and financial reports 100% accurate while hiding the item from active inventory and POS.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900/60 space-y-1 font-mono text-gray-600 dark:text-gray-300">
            <div className="flex justify-between">
              <span>SKU:</span>
              <span className="font-bold text-gray-900 dark:text-white">{productToDelete?.sku}</span>
            </div>
            <div className="flex justify-between">
              <span>Current Stock:</span>
              <span>{productToDelete?.stockQuantity} {productToDelete?.unit}</span>
            </div>
            <div className="flex justify-between">
              <span>Selling Price:</span>
              <span>₹{productToDelete?.sellingPrice?.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-slate-700">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => confirmDeleteProduct(false)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-sm transition disabled:opacity-50"
            >
              {isDeleting ? 'Removing...' : 'Confirm Remove / Archive'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Product Add/Edit Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="e.g. Wireless Ergonomic Mouse"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                required
                value={productForm.categoryId}
                onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={productForm.unit}
                onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                placeholder="pcs, box, kg, litre"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                placeholder="Leave blank to auto-generate"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Barcode / EAN
              </label>
              <input
                type="text"
                value={productForm.barcode}
                onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                placeholder="e.g. 890123456789"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Purchase Cost (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={productForm.purchasePrice}
                onChange={(e) => setProductForm({ ...productForm, purchasePrice: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Selling Retail Price (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={productForm.sellingPrice}
                onChange={(e) => setProductForm({ ...productForm, sellingPrice: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Initial Stock Quantity
              </label>
              <input
                type="number"
                value={productForm.stockQuantity}
                onChange={(e) => setProductForm({ ...productForm, stockQuantity: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Reorder Threshold Alert Level
              </label>
              <input
                type="number"
                value={productForm.reorderLevel}
                onChange={(e) => setProductForm({ ...productForm, reorderLevel: e.target.value })}
                placeholder="10"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>

      {/* Category Add/Edit Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              placeholder="e.g. Office Hardware"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="Brief details regarding this catalog grouping..."
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsCategoryModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm"
            >
              Save Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventory;
