const prisma = require('../config/db');

class DashboardService {
  async getSummary() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

    // 1. Today's sales
    const todaySales = await prisma.sale.aggregate({
      where: { createdAt: { gte: startOfToday } },
      _sum: { grandTotal: true },
      _count: { id: true }
    });

    // 2. Monthly sales revenue
    const monthSales = await prisma.sale.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { grandTotal: true, subtotal: true },
      _count: { id: true }
    });

    // 3. Monthly expenses
    const monthExpenses = await prisma.expense.aggregate({
      where: { date: { gte: startOfMonth } },
      _sum: { amount: true }
    });

    // 4. Calculate COGS for this month's sold items
    const monthSaleItems = await prisma.saleItem.findMany({
      where: {
        sale: { createdAt: { gte: startOfMonth } }
      },
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

    // 5. Low-stock products count (active products only)
    const allProducts = await prisma.product.findMany({
      where: { isArchived: false },
      select: { id: true, name: true, sku: true, stockQuantity: true, reorderLevel: true, category: { select: { name: true } } }
    });
    const lowStockProducts = allProducts.filter(p => p.stockQuantity <= p.reorderLevel);

    // 6. Pending customer payments (outstanding balances)
    const customerDues = await prisma.customer.aggregate({
      where: { outstandingBalance: { gt: 0 } },
      _sum: { outstandingBalance: true },
      _count: { id: true }
    });

    // 7. Top-selling products
    const salesGrouped = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5
    });

    const topProductIds = salesGrouped.map(s => s.productId);
    const topProductDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      select: { id: true, name: true, sku: true, sellingPrice: true, category: { select: { name: true } } }
    });

    const topSellingProducts = salesGrouped.map(s => {
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

    // 8. Total products and customers count
    const totalProductsCount = await prisma.product.count();
    const totalCustomersCount = await prisma.customer.count();

    return {
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

  async getChartsData() {
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
        const aggr = await prisma.sale.aggregate({
          where: {
            createdAt: { gte: day.start, lte: day.end }
          },
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
        const sales = await prisma.sale.aggregate({
          where: { createdAt: { gte: m.start, lte: m.end } },
          _sum: { grandTotal: true }
        });
        const expenses = await prisma.expense.aggregate({
          where: { date: { gte: m.start, lte: m.end } },
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
    const saleItems = await prisma.saleItem.findMany({
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
