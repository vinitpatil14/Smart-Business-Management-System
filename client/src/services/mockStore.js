/**
 * NexPulse Business OS - Client-Side Mock Data & Engine
 * Provides persistent offline & serverless storage for Vercel / Static Deployments
 * Supports full CRUD: POS Sales, Invoices, Inventory, Customers, Expenses, Purchases, Reports, Insights.
 */

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('sbms_user') || '{}');
  } catch {
    return {};
  }
};

const isDemoActive = () => {
  const u = getStoredUser();
  return u?.isDemo === true || (u?.email && u.email.endsWith('@sbms.com'));
};

const getStorageKey = (key) => {
  const u = getStoredUser();
  const prefix = isDemoActive() ? 'sbms_demo_' : `sbms_user_${u?.id || u?.uid || 'guest'}_`;
  return prefix + key;
};

// Initial Seed Data for Demo Showroom
const INITIAL_DEMO_PRODUCTS = [
  { id: 1, name: 'Premium Arabica Coffee Beans 1kg', sku: 'SKU-COF-01', categoryId: 1, category: { id: 1, name: 'Beverages' }, purchasePrice: 450, sellingPrice: 900, stockQuantity: 28, reorderLevel: 10, unit: 'kg', isArchived: false },
  { id: 2, name: 'Organic Green Tea Tin 250g', sku: 'SKU-TEA-02', categoryId: 1, category: { id: 1, name: 'Beverages' }, purchasePrice: 180, sellingPrice: 450, stockQuantity: 14, reorderLevel: 15, unit: 'tin', isArchived: false },
  { id: 3, name: 'Cold Pressed Virgin Coconut Oil 1L', sku: 'SKU-OIL-03', categoryId: 2, category: { id: 2, name: 'Organic Grocery' }, purchasePrice: 280, sellingPrice: 600, stockQuantity: 32, reorderLevel: 10, unit: 'bottle', isArchived: false },
  { id: 4, name: 'Raw Himalayan Honey 500g', sku: 'SKU-HNY-04', categoryId: 2, category: { id: 2, name: 'Organic Grocery' }, purchasePrice: 220, sellingPrice: 550, stockQuantity: 19, reorderLevel: 6, unit: 'jar', isArchived: false },
  { id: 5, name: 'Wireless Optical Barcode Scanner', sku: 'SKU-SCAN-05', categoryId: 3, category: { id: 3, name: 'Electronics & POS' }, purchasePrice: 1200, sellingPrice: 2499, stockQuantity: 8, reorderLevel: 10, unit: 'pcs', isArchived: false },
  { id: 6, name: 'Thermal Receipt Paper Rolls (Pack of 10)', sku: 'SKU-PPR-06', categoryId: 3, category: { id: 3, name: 'Electronics & POS' }, purchasePrice: 140, sellingPrice: 350, stockQuantity: 45, reorderLevel: 15, unit: 'pack', isArchived: false }
];

const INITIAL_DEMO_CATEGORIES = [
  { id: 1, name: 'Beverages', description: 'Coffee, Tea & Natural Brews', _count: { products: 2 } },
  { id: 2, name: 'Organic Grocery', description: 'Oils, Honey & Farm produce', _count: { products: 2 } },
  { id: 3, name: 'Electronics & POS', description: 'Hardware, Scanners & Paper', _count: { products: 2 } }
];

const INITIAL_DEMO_CUSTOMERS = [
  { id: 1, name: 'Rahul Sharma', phone: '9820011223', email: 'rahul.sharma@example.com', address: 'Bandra West, Mumbai', balance: 0, loyaltyPoints: 180 },
  { id: 2, name: 'Priya Deshmukh', phone: '9890123456', email: 'priya.d@example.com', address: 'Shivaji Nagar, Pune', balance: 1450, loyaltyPoints: 240 },
  { id: 3, name: 'Amit Patil', phone: '9765432109', email: 'amit.patil@example.com', address: 'Kothrud, Pune', balance: 0, loyaltyPoints: 95 },
  { id: 4, name: 'Sneha Kulkarni', phone: '9123456780', email: 'sneha.k@example.com', address: 'Deccan, Pune', balance: 650, loyaltyPoints: 310 }
];

const INITIAL_DEMO_SUPPLIERS = [
  { id: 1, name: 'Deccan Agro Wholesalers', contactPerson: 'Vijay Shinde', phone: '9881122334', email: 'sales@deccanagro.in', address: 'Market Yard, Pune', balance: 0 },
  { id: 2, name: 'Apex POS Hardware India', contactPerson: 'Anand Rao', phone: '9845566778', email: 'orders@apexpos.in', address: 'Andheri East, Mumbai', balance: 8500 }
];

const INITIAL_DEMO_EMPLOYEES = [
  { id: 1, name: 'Vinit Patil', email: 'vinit@sbms.com', phone: '9876501234', role: 'MANAGER', department: 'Operations', salary: 45000, joinDate: '2025-01-15', isActive: true },
  { id: 2, name: 'Rajesh Pawar', email: 'rajesh@sbms.com', phone: '9876505678', role: 'STAFF', department: 'Sales POS', salary: 22000, joinDate: '2025-03-01', isActive: true },
  { id: 3, name: 'Snehal Shinde', email: 'snehal@sbms.com', phone: '9876509012', role: 'STAFF', department: 'Inventory', salary: 20000, joinDate: '2025-04-10', isActive: true }
];

const INITIAL_DEMO_EXPENSES = [
  { id: 1, title: 'Store Monthly Electricity Bill', amount: 4850, category: 'Utilities', date: new Date().toISOString(), paymentMethod: 'UPI', notes: 'MSEDCL commercial bill' },
  { id: 2, title: 'High Speed Optical Fiber Internet', amount: 1499, category: 'Utilities', date: new Date(Date.now() - 86400000).toISOString(), paymentMethod: 'ONLINE', notes: 'Airtel broadband' },
  { id: 3, title: 'Store Deep Cleaning & Packaging Bags', amount: 1850, category: 'Supplies', date: new Date(Date.now() - 172800000).toISOString(), paymentMethod: 'CASH', notes: 'Monthly hygiene materials' }
];

const INITIAL_DEMO_PURCHASES = [
  {
    id: 1,
    poNumber: 'PO-2026-001',
    supplierId: 1,
    supplier: { id: 1, name: 'Deccan Agro Wholesalers', contactPerson: 'Vijay Shinde' },
    totalAmount: 18500,
    paidAmount: 18500,
    dueAmount: 0,
    paymentStatus: 'PAID',
    paymentMethod: 'BANK_TRANSFER',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    items: [
      { id: 1, productId: 1, product: { name: 'Premium Arabica Coffee Beans 1kg', sku: 'SKU-COF-01', unit: 'kg' }, quantity: 30, purchasePrice: 450, total: 13500 },
      { id: 2, productId: 4, product: { name: 'Raw Himalayan Honey 500g', sku: 'SKU-HNY-04', unit: 'jar' }, quantity: 20, purchasePrice: 250, total: 5000 }
    ]
  },
  {
    id: 2,
    poNumber: 'PO-2026-002',
    supplierId: 2,
    supplier: { id: 2, name: 'Apex POS Hardware India', contactPerson: 'Anand Rao' },
    totalAmount: 12000,
    paidAmount: 3500,
    dueAmount: 8500,
    paymentStatus: 'PARTIAL',
    paymentMethod: 'UPI',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    items: [
      { id: 3, productId: 5, product: { name: 'Wireless Optical Barcode Scanner', sku: 'SKU-SCAN-05', unit: 'pcs' }, quantity: 10, purchasePrice: 1200, total: 12000 }
    ]
  }
];

const INITIAL_DEMO_SALES = [
  {
    id: 101,
    invoiceNumber: 'INV-2026-089',
    customerId: 1,
    customer: { id: 1, name: 'Rahul Sharma', phone: '9820011223', email: 'rahul.sharma@example.com', loyaltyPoints: 180 },
    subtotal: 2450,
    tax: 0,
    discount: 0,
    grandTotal: 2450,
    paidAmount: 2450,
    dueAmount: 0,
    paymentMode: 'UPI',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
    createdByUser: { name: 'Demo Administrator' },
    items: [
      { id: 1, productId: 1, product: { name: 'Premium Arabica Coffee Beans 1kg', sku: 'SKU-COF-01', unit: 'kg' }, quantity: 2, unitPrice: 900, total: 1800 },
      { id: 2, productId: 4, product: { name: 'Raw Himalayan Honey 500g', sku: 'SKU-HNY-04', unit: 'jar' }, quantity: 1, unitPrice: 650, total: 650 }
    ]
  },
  {
    id: 102,
    invoiceNumber: 'INV-2026-088',
    customerId: 2,
    customer: { id: 2, name: 'Priya Deshmukh', phone: '9890123456', email: 'priya.d@example.com', loyaltyPoints: 240 },
    subtotal: 1890,
    tax: 0,
    discount: 0,
    grandTotal: 1890,
    paidAmount: 1890,
    dueAmount: 0,
    paymentMode: 'CASH',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    createdByUser: { name: 'Demo Operations Manager' },
    items: [
      { id: 3, productId: 2, product: { name: 'Organic Green Tea Tin 250g', sku: 'SKU-TEA-02', unit: 'tin' }, quantity: 2, unitPrice: 450, total: 900 },
      { id: 4, productId: 3, product: { name: 'Cold Pressed Virgin Coconut Oil 1L', sku: 'SKU-OIL-03', unit: 'bottle' }, quantity: 1, unitPrice: 600, total: 600 },
      { id: 5, productId: 6, product: { name: 'Thermal Receipt Paper Rolls', sku: 'SKU-PPR-06', unit: 'pack' }, quantity: 1, unitPrice: 390, total: 390 }
    ]
  },
  {
    id: 103,
    invoiceNumber: 'INV-2026-087',
    customerId: 3,
    customer: { id: 3, name: 'Amit Patil', phone: '9765432109', email: 'amit.patil@example.com', loyaltyPoints: 95 },
    subtotal: 4120,
    tax: 0,
    discount: 0,
    grandTotal: 4120,
    paidAmount: 4120,
    dueAmount: 0,
    paymentMode: 'CARD',
    paymentStatus: 'PAID',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    createdByUser: { name: 'Demo Sales Staff' },
    items: [
      { id: 6, productId: 5, product: { name: 'Wireless Optical Barcode Scanner', sku: 'SKU-SCAN-05', unit: 'pcs' }, quantity: 1, unitPrice: 2499, total: 2499 },
      { id: 7, productId: 1, product: { name: 'Premium Arabica Coffee Beans 1kg', sku: 'SKU-COF-01', unit: 'kg' }, quantity: 1, unitPrice: 900, total: 900 },
      { id: 8, productId: 2, product: { name: 'Organic Green Tea Tin 250g', sku: 'SKU-TEA-02', unit: 'tin' }, quantity: 1, unitPrice: 450, total: 450 }
    ]
  }
];

class MockStore {
  getItem(key, defaultValue = []) {
    const sKey = getStorageKey(key);
    const stored = localStorage.getItem(sKey);
    if (stored) {
      try { return JSON.parse(stored); } catch { return defaultValue; }
    }
    // If demo mode, seed initial sample data
    if (isDemoActive()) {
      let init = defaultValue;
      if (key === 'products') init = INITIAL_DEMO_PRODUCTS;
      if (key === 'categories') init = INITIAL_DEMO_CATEGORIES;
      if (key === 'customers') init = INITIAL_DEMO_CUSTOMERS;
      if (key === 'suppliers') init = INITIAL_DEMO_SUPPLIERS;
      if (key === 'purchases') init = INITIAL_DEMO_PURCHASES;
      if (key === 'employees') init = INITIAL_DEMO_EMPLOYEES;
      if (key === 'expenses') init = INITIAL_DEMO_EXPENSES;
      if (key === 'sales') init = INITIAL_DEMO_SALES;
      localStorage.setItem(sKey, JSON.stringify(init));
      return init;
    }
    return defaultValue;
  }

  setItem(key, value) {
    const sKey = getStorageKey(key);
    localStorage.setItem(sKey, JSON.stringify(value));
  }

  handle(config) {
    const method = (config.method || 'get').toLowerCase();
    const url = (config.url || '').replace(/^https?:\/\/[^/]+/, '').replace(/^\/api/, '');
    const isDemo = isDemoActive();

    // 1. DASHBOARD SUMMARY & CHARTS
    if (url === '/dashboard/summary') {
      if (!isDemo) {
        const myProducts = this.getItem('products', []);
        const mySales = this.getItem('sales', []);
        const myCustomers = this.getItem('customers', []);
        const myExpenses = this.getItem('expenses', []);
        const totalSalesAmt = mySales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
        const totalExpAmt = myExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

        return {
          success: true,
          data: {
            isDemo: false,
            todaySalesAmount: totalSalesAmt,
            todaySalesCount: mySales.length,
            monthlyRevenue: totalSalesAmt,
            monthlySalesCount: mySales.length,
            monthlyExpenses: totalExpAmt,
            estimatedProfit: totalSalesAmt - totalExpAmt,
            lowStockCount: myProducts.filter(p => p.stockQuantity <= p.reorderLevel).length,
            lowStockList: myProducts.filter(p => p.stockQuantity <= p.reorderLevel).slice(0, 5),
            pendingPaymentsTotal: myCustomers.reduce((sum, c) => sum + (c.balance || 0), 0),
            pendingCustomersCount: myCustomers.filter(c => c.balance > 0).length,
            topSellingProducts: [],
            totalProductsCount: myProducts.length,
            totalCustomersCount: myCustomers.length
          }
        };
      }

      // Demo Showroom Full Summary
      return {
        success: true,
        data: {
          isDemo: true,
          todaySalesAmount: 24500,
          todaySalesCount: 14,
          monthlyRevenue: 382400,
          monthlySalesCount: 142,
          monthlyExpenses: 42800,
          estimatedProfit: 94600,
          lowStockCount: 2,
          lowStockList: [
            { id: 5, name: 'Wireless Optical Barcode Scanner', sku: 'SKU-SCAN-05', stockQuantity: 8, reorderLevel: 10, category: { name: 'Electronics & POS' } },
            { id: 2, name: 'Organic Green Tea Tin 250g', sku: 'SKU-TEA-02', stockQuantity: 14, reorderLevel: 15, category: { name: 'Beverages' } }
          ],
          pendingPaymentsTotal: 2100,
          pendingCustomersCount: 2,
          topSellingProducts: [
            { id: 1, name: 'Premium Arabica Coffee Beans 1kg', sku: 'SKU-COF-01', category: 'Beverages', unitsSold: 142, totalSales: 127800 },
            { id: 2, name: 'Organic Green Tea Tin 250g', sku: 'SKU-TEA-02', category: 'Beverages', unitsSold: 98, totalSales: 44100 },
            { id: 3, name: 'Cold Pressed Virgin Coconut Oil 1L', sku: 'SKU-OIL-03', category: 'Organic Grocery', unitsSold: 64, totalSales: 38400 },
            { id: 4, name: 'Raw Himalayan Honey 500g', sku: 'SKU-HNY-04', category: 'Organic Grocery', unitsSold: 52, totalSales: 28600 }
          ],
          totalProductsCount: 48,
          totalCustomersCount: 18
        }
      };
    }

    if (url === '/dashboard/charts') {
      if (!isDemo) {
        return {
          success: true,
          data: {
            salesTrend: [
              { date: 'Mon', sales: 0, orders: 0 },
              { date: 'Tue', sales: 0, orders: 0 },
              { date: 'Wed', sales: 0, orders: 0 },
              { date: 'Thu', sales: 0, orders: 0 },
              { date: 'Fri', sales: 0, orders: 0 },
              { date: 'Sat', sales: 0, orders: 0 },
              { date: 'Sun', sales: 0, orders: 0 }
            ],
            categoryBreakdown: [],
            revenueVsExpenses: []
          }
        };
      }

      // Demo Showroom Full Charts
      return {
        success: true,
        data: {
          salesTrend: [
            { date: '19 Oct', sales: 18400, orders: 9 },
            { date: '20 Oct', sales: 22100, orders: 11 },
            { date: '21 Oct', sales: 19800, orders: 10 },
            { date: '22 Oct', sales: 26500, orders: 13 },
            { date: '23 Oct', sales: 31200, orders: 16 },
            { date: '24 Oct', sales: 38900, orders: 20 },
            { date: '25 Oct', sales: 34500, orders: 18 },
            { date: '26 Oct', sales: 21000, orders: 11 },
            { date: '27 Oct', sales: 27800, orders: 14 },
            { date: '28 Oct', sales: 33400, orders: 17 },
            { date: '29 Oct', sales: 29800, orders: 15 },
            { date: '30 Oct', sales: 42100, orders: 22 },
            { date: '31 Oct', sales: 49500, orders: 26 },
            { date: '01 Nov', sales: 24500, orders: 14 }
          ],
          categoryBreakdown: [
            { name: 'Beverages', value: 171900 },
            { name: 'Organic Grocery', value: 124500 },
            { name: 'Electronics & POS', value: 86000 }
          ],
          revenueVsExpenses: [
            { month: 'Jun 26', revenue: 295000, expenses: 38000 },
            { month: 'Jul 26', revenue: 312000, expenses: 41000 },
            { month: 'Aug 26', revenue: 348000, expenses: 39500 },
            { month: 'Sep 26', revenue: 362000, expenses: 44000 },
            { month: 'Oct 26', revenue: 395000, expenses: 46200 },
            { month: 'Nov 26', revenue: 382400, expenses: 42800 }
          ]
        }
      };
    }

    // 2. INVENTORY PRODUCTS
    if (url.startsWith('/inventory/products')) {
      let products = this.getItem('products', []);

      if (method === 'get') {
        const archivedOnly = config.params?.showArchived === true || config.params?.showArchived === 'true';
        let filtered = products.filter(p => archivedOnly ? p.isArchived : !p.isArchived);

        if (config.params?.search) {
          const s = config.params.search.toLowerCase();
          filtered = filtered.filter(p => p.name.toLowerCase().includes(s) || p.sku.toLowerCase().includes(s));
        }
        if (config.params?.categoryId) {
          filtered = filtered.filter(p => p.categoryId == config.params.categoryId);
        }

        return {
          success: true,
          data: filtered,
          pagination: {
            total: filtered.length,
            page: 1,
            limit: 50,
            totalPages: 1
          }
        };
      }

      if (method === 'post') {
        let body = {};
        try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data; } catch {}
        const newProduct = {
          id: Date.now(),
          name: body.name || 'New Product',
          sku: body.sku || 'SKU-' + Date.now().toString().slice(-4),
          categoryId: Number(body.categoryId || 1),
          purchasePrice: Number(body.purchasePrice || 0),
          sellingPrice: Number(body.sellingPrice || 0),
          stockQuantity: Number(body.stockQuantity || 0),
          reorderLevel: Number(body.reorderLevel || 10),
          unit: body.unit || 'pcs',
          isArchived: false,
          category: { id: Number(body.categoryId || 1), name: 'General' }
        };
        products.unshift(newProduct);
        this.setItem('products', products);
        return { success: true, data: newProduct };
      }

      if (method === 'put') {
        const match = url.match(/\/inventory\/products\/(\d+)/);
        const prodId = match ? Number(match[1]) : 0;
        let body = {};
        try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data; } catch {}
        products = products.map(p => p.id === prodId ? { ...p, ...body, id: prodId } : p);
        this.setItem('products', products);
        return { success: true, data: products.find(p => p.id === prodId) };
      }

      if (method === 'delete') {
        const match = url.match(/\/inventory\/products\/(\d+)/);
        const prodId = match ? Number(match[1]) : 0;
        const isPermanent = config.params?.permanent === true || config.params?.permanent === 'true';
        if (isPermanent) {
          products = products.filter(p => p.id !== prodId);
        } else {
          products = products.map(p => p.id === prodId ? { ...p, isArchived: true } : p);
        }
        this.setItem('products', products);
        return { success: true, message: 'Product archived' };
      }
    }

    // 3. CATEGORIES
    if (url.startsWith('/inventory/categories')) {
      let categories = this.getItem('categories', INITIAL_DEMO_CATEGORIES);
      if (method === 'get') {
        return { success: true, data: categories };
      }
      if (method === 'post') {
        let body = {};
        try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data; } catch {}
        const newCat = { id: Date.now(), name: body.name, description: body.description || '', _count: { products: 0 } };
        categories.push(newCat);
        this.setItem('categories', categories);
        return { success: true, data: newCat };
      }
    }

    // 4. CUSTOMERS
    if (url.startsWith('/customers')) {
      let customers = this.getItem('customers', INITIAL_DEMO_CUSTOMERS);
      if (url === '/customers/all-list' || (url === '/customers' && method === 'get')) {
        return { success: true, data: customers, pagination: { total: customers.length, page: 1, limit: 50, totalPages: 1 } };
      }
      if (method === 'post') {
        let body = {};
        try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data; } catch {}
        const newCust = {
          id: Date.now(),
          name: body.name || 'New Customer',
          phone: body.phone || '',
          email: body.email || '',
          address: body.address || '',
          balance: Number(body.balance || 0),
          loyaltyPoints: 0
        };
        customers.unshift(newCust);
        this.setItem('customers', customers);
        return { success: true, data: newCust };
      }
      if (method === 'put') {
        const match = url.match(/\/customers\/(\d+)/);
        const custId = match ? Number(match[1]) : 0;
        let body = {};
        try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data; } catch {}
        customers = customers.map(c => c.id === custId ? { ...c, ...body, id: custId } : c);
        this.setItem('customers', customers);
        return { success: true, data: customers.find(c => c.id === custId) };
      }
      if (method === 'delete') {
        const match = url.match(/\/customers\/(\d+)/);
        const custId = match ? Number(match[1]) : 0;
        customers = customers.filter(c => c.id !== custId);
        this.setItem('customers', customers);
        return { success: true, message: 'Customer deleted' };
      }
    }

    // 5. SALES & POS
    if (url.startsWith('/sales')) {
      let sales = this.getItem('sales', INITIAL_DEMO_SALES);
      let products = this.getItem('products', INITIAL_DEMO_PRODUCTS);
      let customers = this.getItem('customers', INITIAL_DEMO_CUSTOMERS);

      if (method === 'get') {
        const matchId = url.match(/\/sales\/(\d+)/);
        if (matchId) {
          const saleId = Number(matchId[1]);
          const found = sales.find(s => s.id === saleId) || sales[0];
          return { success: true, data: found };
        }
        return {
          success: true,
          data: sales,
          pagination: { total: sales.length, page: 1, limit: 20, totalPages: 1 }
        };
      }

      if (method === 'post') {
        let body = {};
        try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data; } catch {}
        const invoiceNum = 'INV-2026-' + (sales.length + 101).toString().padStart(3, '0');

        const items = (body.items || []).map((it, idx) => {
          const prod = products.find(p => p.id === it.productId) || {};
          const qty = Number(it.quantity || 1);
          const price = Number(it.unitPrice || prod.sellingPrice || 0);
          return {
            id: idx + 1,
            productId: it.productId,
            product: { name: prod.name || 'Product Item', sku: prod.sku || 'SKU', unit: prod.unit || 'pcs' },
            quantity: qty,
            unitPrice: price,
            total: price * qty
          };
        });

        // Decrement product stock in local store
        products = products.map(p => {
          const soldItem = items.find(it => it.productId === p.id);
          if (soldItem) {
            return { ...p, stockQuantity: Math.max(0, p.stockQuantity - soldItem.quantity) };
          }
          return p;
        });
        this.setItem('products', products);

        const subtotal = items.reduce((sum, it) => sum + it.total, 0);
        const taxRate = Number(body.taxPercent || 0);
        const tax = Math.round((subtotal * taxRate) / 100);
        const discount = Number(body.discount || 0);
        const grandTotal = Math.max(0, subtotal + tax - discount);
        const paidAmount = Number(body.paidAmount ?? grandTotal);
        const dueAmount = Math.max(0, grandTotal - paidAmount);
        const paymentMode = body.paymentMode || 'CASH';
        const paymentStatus = dueAmount === 0 ? 'PAID' : (paidAmount > 0 ? 'PARTIAL' : 'DUE');

        const cust = body.customerId ? customers.find(c => c.id === body.customerId) : null;
        if (cust && dueAmount > 0) {
          cust.balance = (cust.balance || 0) + dueAmount;
          this.setItem('customers', customers);
        }

        const newSale = {
          id: Date.now(),
          invoiceNumber: invoiceNum,
          customerId: body.customerId || null,
          customer: cust || null,
          items,
          subtotal,
          tax,
          discount,
          grandTotal,
          paidAmount,
          dueAmount,
          paymentMode,
          paymentStatus,
          status: 'COMPLETED',
          notes: body.notes || '',
          createdAt: new Date().toISOString(),
          createdByUser: { name: getStoredUser()?.name || 'Staff' }
        };

        sales.unshift(newSale);
        this.setItem('sales', sales);
        return { success: true, data: newSale };
      }
    }

    // 6. EXPENSES
    if (url.startsWith('/expenses')) {
      let expenses = this.getItem('expenses', INITIAL_DEMO_EXPENSES);
      if (url === '/expenses/summary') {
        const total = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
        return {
          success: true,
          data: {
            totalExpenses: total,
            thisMonth: total,
            categorySummary: [
              { category: 'Utilities', _sum: { amount: 6349 } },
              { category: 'Supplies', _sum: { amount: 1850 } }
            ]
          }
        };
      }
      if (method === 'get') {
        return { success: true, data: expenses, pagination: { total: expenses.length, page: 1, limit: 50, totalPages: 1 } };
      }
      if (method === 'post') {
        let body = {};
        try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data; } catch {}
        const newExp = {
          id: Date.now(),
          title: body.title || 'Expense',
          amount: Number(body.amount || 0),
          category: body.category || 'General',
          date: body.date || new Date().toISOString(),
          paymentMethod: body.paymentMethod || 'UPI',
          notes: body.notes || ''
        };
        expenses.unshift(newExp);
        this.setItem('expenses', expenses);
        return { success: true, data: newExp };
      }
      if (method === 'delete') {
        const match = url.match(/\/expenses\/(\d+)/);
        const expId = match ? Number(match[1]) : 0;
        expenses = expenses.filter(e => e.id !== expId);
        this.setItem('expenses', expenses);
        return { success: true, message: 'Expense deleted' };
      }
    }

    // 7. PURCHASES & SUPPLIERS
    if (url.startsWith('/purchases')) {
      if (url === '/purchases/suppliers') {
        let suppliers = this.getItem('suppliers', INITIAL_DEMO_SUPPLIERS);
        if (method === 'post') {
          let body = {};
          try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data; } catch {}
          const newSup = { id: Date.now(), ...body, balance: 0 };
          suppliers.push(newSup);
          this.setItem('suppliers', suppliers);
          return { success: true, data: newSup };
        }
        return { success: true, data: suppliers };
      }

      let purchases = this.getItem('purchases', INITIAL_DEMO_PURCHASES);
      if (method === 'post') {
        let body = {};
        try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data; } catch {}
        const newPO = {
          id: Date.now(),
          poNumber: 'PO-2026-' + (purchases.length + 101).toString().padStart(3, '0'),
          supplierId: body.supplierId,
          supplier: this.getItem('suppliers', INITIAL_DEMO_SUPPLIERS).find(s => s.id === body.supplierId) || { name: 'Supplier' },
          totalAmount: Number(body.totalAmount || 0),
          paidAmount: Number(body.paidAmount || 0),
          dueAmount: Math.max(0, Number(body.totalAmount || 0) - Number(body.paidAmount || 0)),
          paymentStatus: Number(body.paidAmount || 0) >= Number(body.totalAmount || 0) ? 'PAID' : 'PARTIAL',
          paymentMethod: body.paymentMethod || 'BANK_TRANSFER',
          items: body.items || [],
          createdAt: new Date().toISOString()
        };
        purchases.unshift(newPO);
        this.setItem('purchases', purchases);
        return { success: true, data: newPO };
      }

      return {
        success: true,
        data: purchases,
        pagination: { total: purchases.length, page: 1, limit: 10, totalPages: 1 }
      };
    }

    // 8. EMPLOYEES & PAYROLL
    if (url.startsWith('/employees')) {
      let employees = this.getItem('employees', INITIAL_DEMO_EMPLOYEES);
      if (url === '/employees/attendance') {
        return { success: true, data: employees.map(e => ({ id: e.id, employeeId: e.id, employee: e, status: 'PRESENT', date: new Date().toISOString() })) };
      }
      if (url === '/employees/payroll') {
        return { success: true, data: employees.map(e => ({ id: e.id, employeeId: e.id, employee: e, basicSalary: e.salary, netSalary: e.salary, status: 'PAID' })) };
      }
      return { success: true, data: employees };
    }

    // 9. SMART INSIGHTS
    if (url.startsWith('/smart')) {
      if (url === '/smart/low-stock-prediction') {
        return {
          success: true,
          data: {
            criticalCount: 2,
            predictions: [
              { id: 1, name: 'Premium Arabica Coffee Beans 1kg', sku: 'SKU-COF-01', stockQuantity: 28, unit: 'kg', reorderLevel: 10, soldLast14Days: 42, dailyBurnRate: '3.0', daysRemaining: 9, riskLevel: 'HIGH', recommendedReorder: 50 },
              { id: 2, name: 'Organic Green Tea Tin 250g', sku: 'SKU-TEA-02', stockQuantity: 14, unit: 'tin', reorderLevel: 15, soldLast14Days: 28, dailyBurnRate: '2.0', daysRemaining: 7, riskLevel: 'HIGH', recommendedReorder: 35 },
              { id: 5, name: 'Wireless Optical Barcode Scanner', sku: 'SKU-SCAN-05', stockQuantity: 8, unit: 'pcs', reorderLevel: 10, soldLast14Days: 14, dailyBurnRate: '1.0', daysRemaining: 8, riskLevel: 'HIGH', recommendedReorder: 15 },
              { id: 4, name: 'Raw Himalayan Honey 500g', sku: 'SKU-HNY-04', stockQuantity: 19, unit: 'jar', reorderLevel: 6, soldLast14Days: 12, dailyBurnRate: '0.9', daysRemaining: 21, riskLevel: 'SAFE', recommendedReorder: 0 }
            ]
          }
        };
      }
      if (url === '/smart/product-insights') {
        return {
          success: true,
          data: {
            topPerformers: [
              { id: 1, name: 'Premium Arabica Coffee Beans 1kg', sku: 'SKU-COF-01', sellingPrice: 900, unitsSold: 142, totalRevenue: 127800 },
              { id: 2, name: 'Organic Green Tea Tin 250g', sku: 'SKU-TEA-02', sellingPrice: 450, unitsSold: 98, totalRevenue: 44100 },
              { id: 3, name: 'Cold Pressed Virgin Coconut Oil 1L', sku: 'SKU-OIL-03', sellingPrice: 600, unitsSold: 64, totalRevenue: 38400 }
            ],
            highMarginProducts: [
              { id: 2, name: 'Organic Green Tea Tin 250g', purchasePrice: 180, sellingPrice: 450, marginPercent: '60.0', unitMargin: 270 },
              { id: 4, name: 'Raw Himalayan Honey 500g', purchasePrice: 220, sellingPrice: 550, marginPercent: '60.0', unitMargin: 330 },
              { id: 3, name: 'Cold Pressed Virgin Coconut Oil 1L', purchasePrice: 280, sellingPrice: 600, marginPercent: '53.3', unitMargin: 320 }
            ],
            deadStockCount: 1,
            deadStock: [
              { id: 6, name: 'Thermal Receipt Paper Rolls (Pack of 10)', sku: 'SKU-PPR-06', category: 'Electronics & POS', stockQuantity: 45, purchasePrice: 140 }
            ]
          }
        };
      }
      if (url === '/smart/payment-reminders') {
        return {
          success: true,
          data: {
            totalOutstanding: 2100,
            totalCustomers: 2,
            reminders: [
              {
                customerId: 2,
                name: 'Priya Deshmukh',
                phone: '9890123456',
                outstandingBalance: 1450,
                daysOverdue: 18,
                urgency: 'HIGH',
                reminderMessage: 'Namaste Priya ji, this is a gentle reminder from NexPulse Store regarding your pending balance of ₹1,450.00 overdue since 18 days. Please settle at your earliest convenience via UPI: sbms@upi.'
              },
              {
                customerId: 4,
                name: 'Sneha Kulkarni',
                phone: '9123456780',
                outstandingBalance: 650,
                daysOverdue: 8,
                urgency: 'MODERATE',
                reminderMessage: 'Hello Sneha ji, your invoice balance of ₹650.00 is due for settlement. Kindly confirm once paid.'
              }
            ]
          }
        };
      }
    }

    // 10. REPORTS
    if (url.startsWith('/reports')) {
      if (url.startsWith('/reports/sales')) {
        const sales = this.getItem('sales', INITIAL_DEMO_SALES);
        const totalSales = sales.reduce((sum, s) => sum + (s.grandTotal || 0), 0);
        const totalTax = sales.reduce((sum, s) => sum + (s.tax || 0), 0);
        const totalDiscount = sales.reduce((sum, s) => sum + (s.discount || 0), 0);
        const totalBalance = sales.reduce((sum, s) => sum + (s.dueAmount || 0), 0);

        return {
          success: true,
          data: {
            summary: {
              totalSales: totalSales || 382400,
              totalTax: totalTax || 18400,
              totalDiscount: totalDiscount || 4200,
              totalBalance: totalBalance || 2100,
              orderCount: sales.length || 142
            },
            sales: sales.map(s => ({
              ...s,
              taxAmount: s.tax || 0
            }))
          }
        };
      }
      if (url.startsWith('/reports/profit-loss')) {
        return {
          success: true,
          data: {
            startDate: '2026-10-01',
            endDate: '2026-11-01',
            revenue: {
              grossSales: 382400,
              subtotal: 368200,
              taxCollected: 18400,
              totalDiscounts: 4200
            },
            costOfGoodsSold: 245000,
            grossMarginPercent: '35.9',
            grossProfit: 137400,
            operatingExpenses: {
              total: 42800,
              breakdown: {
                Utilities: 6349,
                Supplies: 1850,
                Salaries: 34601
              }
            },
            netMarginPercent: '24.7',
            netProfit: 94600
          }
        };
      }
      if (url.startsWith('/reports/stock')) {
        let products = this.getItem('products', INITIAL_DEMO_PRODUCTS);
        const totalUnits = products.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
        const totalCost = products.reduce((sum, p) => sum + ((p.stockQuantity || 0) * (p.purchasePrice || 0)), 0);
        const totalRetail = products.reduce((sum, p) => sum + ((p.stockQuantity || 0) * (p.sellingPrice || 0)), 0);

        return {
          success: true,
          data: {
            totalStockUnits: totalUnits,
            totalValuationCost: totalCost,
            totalValuationRetail: totalRetail,
            potentialProfit: totalRetail - totalCost,
            products: products.map(p => ({
              ...p,
              valuationCost: (p.stockQuantity || 0) * (p.purchasePrice || 0),
              valuationRetail: (p.stockQuantity || 0) * (p.sellingPrice || 0),
              marginPercent: p.sellingPrice ? Math.round(((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100) : 0
            }))
          }
        };
      }
      if (url.startsWith('/reports/customer-dues')) {
        return {
          success: true,
          data: {
            totalReceivables: 2100,
            customerCount: 2,
            customers: [
              { id: 2, name: 'Priya Deshmukh', phone: '9890123456', email: 'priya.d@example.com', pendingInvoicesCount: 1, outstandingBalance: 1450 },
              { id: 4, name: 'Sneha Kulkarni', phone: '9123456780', email: 'sneha.k@example.com', pendingInvoicesCount: 1, outstandingBalance: 650 }
            ]
          }
        };
      }
    }

    // 11. USER MANAGEMENT
    if (url.startsWith('/auth/users')) {
      return {
        success: true,
        data: [
          { id: 'usr-admin', name: 'Demo Administrator', email: 'admin@sbms.com', role: 'ADMIN', createdAt: '2026-01-01T00:00:00.000Z' },
          { id: 'usr-manager', name: 'Operations Manager', email: 'manager@sbms.com', role: 'MANAGER', createdAt: '2026-02-01T00:00:00.000Z' },
          { id: 'usr-staff', name: 'Sales Cashier', email: 'staff@sbms.com', role: 'STAFF', createdAt: '2026-03-01T00:00:00.000Z' }
        ]
      };
    }

    // Generic fallback
    return { success: true, data: [] };
  }
}

export const mockStore = new MockStore();
