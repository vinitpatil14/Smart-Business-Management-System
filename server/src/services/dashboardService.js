const prisma = require('../config/db');
const { isDemoUser } = require('../utils/userScope');

class DashboardService {
  async getSummary(user) {
    const isDemo = isDemoUser(user);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

    // Sales filter condition based on user scope
    const saleWhereToday = isDemo
      ? { createdAt: { gte: startOfToday } }
      : { createdByUserId: user?.id || -1, createdAt: { gte: startOfToday } };

    const saleWhereMonth = isDemo
      ? { createdAt: { gte: startOfMonth } }
      : { createdByUserId: user?.id || -1, createdAt: { gte: startOfMonth } };

    const expenseWhereMonth = isDemo
      ? { date: { gte: startOfMonth } }
      : { recordedByUserId: user?.id || -1, date: { gte: startOfMonth } };

    // 1. Today's sales
    const todaySales = await prisma.sale.aggregate({
      where: saleWhereToday,
      _sum: { grandTotal: true },
      _count: { id: true }
    });

    // 2. Monthly sales revenue
    const monthSales = await prisma.sale.aggregate({
      where: saleWhereMonth,
      _sum: { grandTotal: true, subtotal: true },
      _count: { id: true }
    });

    // 3. Monthly expenses
    const monthExpenses = await prisma.expense.aggregate({
      where: expenseWhereMonth,
      _sum: { amount: true }
    });

    // 4. Calculate COGS for this month's sold items
    const monthSaleItems = await prisma.saleItem.findMany({
      where: isDemo
        ? { sale: { createdAt: { gte: startOfMonth } } }
        : { sale: { createdByUserId: user?.id || -1, createdAt: { gte: startOfMonth } } },
      include: {
        product: { select: { purchasePrice: true } }
      }
    });

    const monthCogs = monthSaleItems.reduce((acc, item) => {
      const cost = item.product?.purchasePrice || 0;
      return acc + (cost * item.quantity);
    }, 0);

    const totalRevenue = monthSales._sum.grandTotal || 0;
    const totalExpenses = monthExpenses._sum.amount || 0;
    const estimatedProfit = Math.round((totalRevenue - monthCogs - totalExpenses) * 100) / 100;

    // 5. Low-stock products count
    const productWhere = isDemo
      ? { isArchived: false }
      : { isArchived: false, id: { gt: 11 } };

    const allProducts = await prisma.product.findMany({
      where: productWhere,
      select: { id: true, name: true, sku: true, stockQuantity: true, reorderLevel: true, category: { select: { name: true } } }
    });
    const lowStockProducts = allProducts.filter(p => p.stockQuantity <= p.reorderLevel);

    // 6. Pending customer payments (outstanding balances)
    const customerWhere = isDemo
      ? { outstandingBalance: { gt: 0 } }
      : { id: { gt: 6 }, outstandingBalance: { gt: 0 } };

    const customerDues = await prisma.customer.aggregate({
      where: customerWhere,
      _sum: { outstandingBalance: true },
      _count: { id: true }
    });

    // 7. Top-selling products
    let topSellingProducts = [];
    if (isDemo || monthSaleItems.length > 0) {
      const salesGrouped = await prisma.saleItem.groupBy({
        by: ['productId'],
        where: isDemo ? {} : { sale: { createdByUserId: user?.id || -1 } },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      });

      const topProductIds = salesGrouped.map(s => s.productId);
      if (topProductIds.length > 0) {
        const topProductDetails = await prisma.product.findMany({
          where: { id: { in: topProductIds } },
          select: { id: true, name: true, sku: true, sellingPrice: true, category: { select: { name: true } } }
        });

        topSellingProducts = salesGrouped.map(s => {
          const prod = topProductDetails.find(p => p.id === s.productId);
          return {
            id: s.productId,
            name: prod?.name || 'Unknown',
            sku: prod?.sku || '',
            category: prod?.category?.name || 'Uncategorized',
            unitsSold: s._sum.quantity || 0,
            totalSales: s._sum.total || 0
          };
        });
      }
    }

    // 8. Total products and customers count
    const totalProductsCount = isDemo
      ? await prisma.product.count()
      : await prisma.product.count({ where: { id: { gt: 11 } } });

    const totalCustomersCount = isDemo
      ? await prisma.customer.count()
      : await prisma.customer.count({ where: { id: { gt: 6 } } });

    return {
      isDemo,
      todaySalesAmount: todaySales._sum.grandTotal || 0,
      todaySalesCount: todaySales._count.id || 0,
      monthlyRevenue: totalRevenue,
      monthlySalesCount: monthSales._count.id || 0,
      monthlyExpenses: totalExpenses,
      estimatedProfit,
      lowStockCount: lowStockProducts.length,
      lowStockList: lowStockProducts.slice(0, 5),
      pendingPaymentsTotal: customerDues._sum.outstandingBalance || 0,
      pendingCustomersCount: customerDues._count.id || 0,
      topSellingProducts,
      totalProductsCount,
      totalCustomersCount
    };
  }

  async getChartsData(user) {
    const isDemo = isDemoUser(user);

    // 1. Line Chart: Daily Sales Trend (past 14 days)
    const past14Days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      past14Days.push({ dateStr, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), start, end });
    }

    const salesTrend = await Promise.all(
      past14Days.map(async (day) => {
        const whereClause = isDemo
          ? { createdAt: { gte: day.start, lte: day.end } }
          : { createdByUserId: user?.id || -1, createdAt: { gte: day.start, lte: day.end } };

        const aggr = await prisma.sale.aggregate({
          where: whereClause,
          _sum: { grandTotal: true },
          _count: { id: true }
        });
        return {
          date: day.label,
          fullDate: day.dateStr,
          sales: aggr._sum.grandTotal || 0,
          orders: aggr._count.id || 0
        };
      })
    );

    // 2. Bar Chart: Monthly Revenue vs Expenses (past 6 months)
    const past6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      past6Months.push({ monthLabel, start, end });
    }

    const revenueVsExpenses = await Promise.all(
      past6Months.map(async (m) => {
        const salesWhere = isDemo
          ? { createdAt: { gte: m.start, lte: m.end } }
          : { createdByUserId: user?.id || -1, createdAt: { gte: m.start, lte: m.end } };

        const expenseWhere = isDemo
          ? { date: { gte: m.start, lte: m.end } }
          : { recordedByUserId: user?.id || -1, date: { gte: m.start, lte: m.end } };

        const sales = await prisma.sale.aggregate({
          where: salesWhere,
          _sum: { grandTotal: true }
        });
        const expenses = await prisma.expense.aggregate({
          where: expenseWhere,
          _sum: { amount: true }
        });
        return {
          month: m.monthLabel,
          revenue: sales._sum.grandTotal || 0,
          expenses: expenses._sum.amount || 0
        };
      })
    );

    // 3. Pie Chart: Sales breakdown by Category
    const saleItemWhere = isDemo
      ? {}
      : { sale: { createdByUserId: user?.id || -1 } };

    const saleItems = await prisma.saleItem.findMany({
      where: saleItemWhere,
      include: {
        product: {
          select: {
            category: { select: { id: true, name: true } }
          }
        }
      }
    });

    const categoryMap = {};
    for (const item of saleItems) {
      const catName = item.product?.category?.name || 'Other';
      categoryMap[catName] = (categoryMap[catName] || 0) + item.total;
    }

    const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100
    }));

    return {
      salesTrend,
      revenueVsExpenses,
      categoryBreakdown
    };
  }
}

module.exports = new DashboardService();
