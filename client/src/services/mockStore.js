/**
 * NexPulse Business OS - Client-Side Data & Fallback Engine
 * Provides persistent offline & cloud-free storage for Vercel / Static Deployments
 * Automatically separates Real User data from Demo Showroom data.
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
  { id: 2, name: 'Organic Green Tea Tin 250g', sku: 'SKU-TEA-02', categoryId: 1, category: { id: 1, name: 'Beverages' }, purchasePrice: 180, sellingPrice: 450, stockQuantity: 14, reorderLevel: 8, unit: 'tin', isArchived: false },
  { id: 3, name: 'Cold Pressed Virgin Coconut Oil 1L', sku: 'SKU-OIL-03', categoryId: 2, category: { id: 2, name: 'Organic Grocery' }, purchasePrice: 280, sellingPrice: 600, stockQuantity: 32, reorderLevel: 10, unit: 'bottle', isArchived: false },
  { id: 4, name: 'Raw Himalayan Honey 500g', sku: 'SKU-HNY-04', categoryId: 2, category: { id: 2, name: 'Organic Grocery' }, purchasePrice: 220, sellingPrice: 550, stockQuantity: 19, reorderLevel: 6, unit: 'jar', isArchived: false },
  { id: 5, name: 'Wireless Optical Barcode Scanner', sku: 'SKU-SCAN-05', categoryId: 3, category: { id: 3, name: 'Electronics & POS' }, purchasePrice: 1200, sellingPrice: 2499, stockQuantity: 8, reorderLevel: 5, unit: 'pcs', isArchived: false },
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

const INITIAL_DEMO_SALES = [
  {
    id: 101,
    invoiceNumber: 'INV-2026-089',
    customerId: 1,
    customer: { id: 1, name: 'Rahul Sharma', phone: '9820011223' },
    subtotal: 2450,
    tax: 0,
    discount: 0,
    grandTotal: 2450,
    paidAmount: 2450,
    dueAmount: 0,
    paymentMethod: 'UPI',
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
    items: [
      { id: 1, productId: 1, product: { name: 'Premium Arabica Coffee Beans 1kg', sku: 'SKU-COF-01', unit: 'kg' }, quantity: 2, unitPrice: 900, total: 1800 },
      { id: 2, productId: 4, product: { name: 'Raw Himalayan Honey 500g', sku: 'SKU-HNY-04', unit: 'jar' }, quantity: 1, unitPrice: 650, total: 650 }
    ]
  },
  {
    id: 102,
    invoiceNumber: 'INV-2026-088',
    customerId: 2,
    customer: { id: 2, name: 'Priya Deshmukh', phone: '9890123456' },
    subtotal: 1890,
    tax: 0,
    discount: 0,
    grandTotal: 1890,
    paidAmount: 1890,
    dueAmount: 0,
    paymentMethod: 'CASH',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
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
    customer: { id: 3, name: 'Amit Patil', phone: '9765432109' },
    subtotal: 4120,
    tax: 0,
    discount: 0,
    grandTotal: 4120,
    paidAmount: 4120,
    dueAmount: 0,
    paymentMethod: 'CARD',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
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
    // If demo mode, seed initial data
    if (isDemoActive()) {
      let init = defaultValue;
      if (key === 'products') init = INITIAL_DEMO_PRODUCTS;
      if (key === 'categories') init = INITIAL_DEMO_CATEGORIES;
      if (key === 'customers') init = INITIAL_DEMO_CUSTOMERS;
      if (key === 'suppliers') init = INITIAL_DEMO_SUPPLIERS;
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

    // 1. DASHBOARD
    if (url === '/dashboard/summary') {
      if (!isDemo) {
        return {
          success: true,
          data: {
            isDemo: false,
            todaySalesAmount: 0,
            todaySalesCount: 0,
            monthlyRevenue: 0,
            monthlyNetProfit: 0,
            profitMargin: '0.0',
            totalInventoryValuation: 0,
            lowStockItemsCount: 0,
            outOfStockItemsCount: 0,
            totalProductsCount: this.getItem('products', []).length,
            pendingDuesAmount: 0,
            topSellingProducts: [],
            recentSales: [],
            lowStockAlerts: []
          }
        };
      }
      return {
        success: true,
        data: {
          isDemo: true,
          todaySalesAmount: 24500,
          todaySalesCount: 14,
          monthlyRevenue: 382400,
          monthlyNetProfit: 94600,
          profitMargin: '24.7',
          totalInventoryValuation: 875000,
          lowStockItemsCount: 2,
          outOfStockItemsCount: 0,
          totalProductsCount: 48,
          pendingDuesAmount: 1450,
          topSellingProducts: [
            { id: 1, name: 'Premium Arabica Coffee Beans 1kg', totalQty: 142, revenue: 127800 },
            { id: 2, name: 'Organic Green Tea Tin 250g', totalQty: 98, revenue: 44100 },
            { id: 3, name: 'Cold Pressed Virgin Coconut Oil 1L', totalQty: 64, revenue: 38400 },
            { id: 4, name: 'Raw Himalayan Honey 500g', totalQty: 52, revenue: 28600 }
          ],
          recentSales: this.getItem('sales', INITIAL_DEMO_SALES).slice(0, 5),
          lowStockAlerts: [
            { id: 1, name: 'Wireless Optical Barcode Scanner', stockQuantity: 8, reorderLevel: 10, sku: 'SKU-SCAN-05' },
            { id: 2, name: 'Organic Green Tea Tin 250g', stockQuantity: 14, reorderLevel: 15, sku: 'SKU-TEA-02' }
          ]
        }
      };
    }

    if (url === '/dashboard/charts') {
      if (!isDemo) {
        return {
          success: true,
          data: {
            weeklyRevenue: [
              { day: 'Mon', revenue: 0, bills: 0 },
              { day: 'Tue', revenue: 0, bills: 0 },
              { day: 'Wed', revenue: 0, bills: 0 },
              { day: 'Thu', revenue: 0, bills: 0 },
              { day: 'Fri', revenue: 0, bills: 0 },
              { day: 'Sat', revenue: 0, bills: 0 },
              { day: 'Sun', revenue: 0, bills: 0 }
            ],
            paymentBreakdown: [],
            categoryShare: []
          }
        };
      }
      return {
        success: true,
        data: {
          weeklyRevenue: [
            { day: 'Mon', revenue: 28500, bills: 12 },
            { day: 'Tue', revenue: 34200, bills: 15 },
            { day: 'Wed', revenue: 41000, bills: 18 },
            { day: 'Thu', revenue: 31800, bills: 14 },
            { day: 'Fri', revenue: 48900, bills: 22 },
            { day: 'Sat', revenue: 62400, bills: 29 },
            { day: 'Sun', revenue: 54600, bills: 25 }
          ],
          paymentBreakdown: [
            { name: 'UPI / QR', value: 58 },
            { name: 'Cash', value: 26 },
            { name: 'Card', value: 16 }
          ],
          categoryShare: [
            { name: 'Beverages', value: 45 },
            { name: 'Organic Grocery', value: 35 },
            { name: 'POS Hardware', value: 20 }
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
          category: { id: 1, name: 'General' }
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
      if (method === 'get') {
        return {
          success: true,
          data: sales,
          pagination: { total: sales.length, page: 1, limit: 20, totalPages: 1 }
        };
      }
      if (method === 'post') {
        let body = {};
        try { body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data; } catch {}
        const invoiceNum = 'INV-2026-' + (sales.length + 100).toString().padStart(3, '0');
        const newSale = {
          id: Date.now(),
          invoiceNumber: invoiceNum,
          customerId: body.customerId || null,
          customer: body.customer || { name: 'Walk-in Customer' },
          subtotal: Number(body.subtotal || body.grandTotal || 0),
          tax: Number(body.tax || 0),
          discount: Number(body.discount || 0),
          grandTotal: Number(body.grandTotal || 0),
          paidAmount: Number(body.paidAmount || body.grandTotal || 0),
          dueAmount: Number(body.dueAmount || 0),
          paymentMethod: body.paymentMethod || 'CASH',
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
          items: (body.items || []).map((it, idx) => ({
            id: idx + 1,
            productId: it.productId,
            product: it.product || { name: it.name || 'Product', sku: 'SKU' },
            quantity: Number(it.quantity || 1),
            unitPrice: Number(it.unitPrice || 0),
            total: Number(it.total || (it.unitPrice * it.quantity))
          }))
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
        return { success: true, data: this.getItem('suppliers', INITIAL_DEMO_SUPPLIERS) };
      }
      return { success: true, data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } };
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
            predictions: [
              { id: 1, name: 'Premium Arabica Coffee Beans 1kg', sku: 'SKU-COF-01', stockQuantity: 28, burnRate: '2.4', daysRemaining: 11, riskLevel: 'MEDIUM', recommendedReorder: 30 },
              { id: 2, name: 'Organic Green Tea Tin 250g', sku: 'SKU-TEA-02', stockQuantity: 14, burnRate: '1.8', daysRemaining: 7, riskLevel: 'HIGH', recommendedReorder: 25 }
            ]
          }
        };
      }
      if (url === '/smart/product-insights') {
        return {
          success: true,
          data: {
            fastMoving: [{ id: 1, name: 'Premium Arabica Coffee Beans 1kg', salesVelocity: 'High' }],
            slowMoving: [{ id: 5, name: 'Wireless Barcode Scanner', salesVelocity: 'Low' }]
          }
        };
      }
      if (url === '/smart/payment-reminders') {
        return {
          success: true,
          data: {
            overdueCustomers: [
              { id: 2, name: 'Priya Deshmukh', phone: '9890123456', balance: 1450, daysPending: 18 }
            ]
          }
        };
      }
    }

    // 10. REPORTS
    if (url.startsWith('/reports')) {
      if (url.startsWith('/reports/sales')) {
        return {
          success: true,
          data: {
            totalRevenue: 382400,
            totalBills: 142,
            averageBillValue: 2692,
            salesByDay: [
              { date: '2026-11-01', total: 24500, bills: 14 },
              { date: '2026-10-31', total: 31200, bills: 16 }
            ]
          }
        };
      }
      if (url.startsWith('/reports/profit-loss')) {
        return {
          success: true,
          data: {
            totalRevenue: 382400,
            cogs: 245000,
            grossProfit: 137400,
            expenses: 42800,
            netProfit: 94600
          }
        };
      }
      if (url.startsWith('/reports/stock')) {
        return {
          success: true,
          data: {
            totalItems: 48,
            totalValuation: 875000,
            lowStockItems: 2
          }
        };
      }
      if (url.startsWith('/reports/customer-dues')) {
        return {
          success: true,
          data: {
            totalDues: 2100,
            duesList: [
              { id: 2, customerName: 'Priya Deshmukh', phone: '9890123456', dueAmount: 1450 },
              { id: 4, customerName: 'Sneha Kulkarni', phone: '9123456780', dueAmount: 650 }
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

    // Generic fallback for any other GET/POST
    return { success: true, data: [] };
  }
}

export const mockStore = new MockStore();
