const prisma = require('../config/db');

class ReportService {
  async getSalesReport({ period = 'monthly', startDate, endDate }) {
    const now = new Date();
    let filterStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    let filterEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    if (startDate) filterStart = new Date(startDate);
    if (endDate) {
      filterEnd = new Date(endDate);
      filterEnd.setHours(23, 59, 59, 999);
    } else if (period === 'daily') {
      filterStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (period === 'weekly') {
      filterStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'yearly') {
      filterStart = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    }

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: filterStart, lte: filterEnd }
      },
      include: {
        customer: { select: { name: true, phone: true } },
        createdByUser: { select: { name: true } },
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const summary = sales.reduce(
      (acc, s) => {
        acc.totalSales += s.grandTotal;
        acc.totalSubtotal += s.subtotal;
        acc.totalTax += s.taxAmount;
        acc.totalDiscount += s.discount;
        acc.totalPaid += s.paidAmount;
        acc.totalBalance += s.balanceAmount;
        acc.count++;
        return acc;
      },
      { totalSales: 0, totalSubtotal: 0, totalTax: 0, totalDiscount: 0, totalPaid: 0, totalBalance: 0, count: 0 }
    );

    return {
      period,
      startDate: filterStart.toISOString(),
      endDate: filterEnd.toISOString(),
      summary: {
        totalSales: Math.round(summary.totalSales * 100) / 100,
        totalSubtotal: Math.round(summary.totalSubtotal * 100) / 100,
        totalTax: Math.round(summary.totalTax * 100) / 100,
        totalDiscount: Math.round(summary.totalDiscount * 100) / 100,
        totalPaid: Math.round(summary.totalPaid * 100) / 100,
        totalBalance: Math.round(summary.totalBalance * 100) / 100,
        orderCount: summary.count
      },
      sales
    };
  }

  async getProfitLossReport({ startDate, endDate }) {
    const now = new Date();
    const filterStart = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    let filterEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    if (endDate) {
      filterEnd = new Date(endDate);
      filterEnd.setHours(23, 59, 59, 999);
    }

    // 1. Sales revenue
    const salesAggr = await prisma.sale.aggregate({
      where: { createdAt: { gte: filterStart, lte: filterEnd } },
      _sum: { grandTotal: true, subtotal: true, taxAmount: true, discount: true },
      _count: { id: true }
    });

    // 2. Cost of Goods Sold (COGS)
    const saleItems = await prisma.saleItem.findMany({
      where: {
        sale: { createdAt: { gte: filterStart, lte: filterEnd } }
      },
      include: {
        product: { select: { purchasePrice: true } }
      }
    });

    const totalCogs = saleItems.reduce((acc, item) => {
      const unitCost = item.product?.purchasePrice || 0;
      return acc + (unitCost * item.quantity);
    }, 0);

    // 3. Operating Expenses
    const expenses = await prisma.expense.findMany({
      where: { date: { gte: filterStart, lte: filterEnd } }
    });

    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

    const expenseByCategory = expenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});

    const totalRevenue = salesAggr._sum.grandTotal || 0;
    const grossProfit = Math.round((totalRevenue - totalCogs) * 100) / 100;
    const netProfit = Math.round((grossProfit - totalExpenses) * 100) / 100;
    const grossMarginPercent = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 1000) / 10 : 0;
    const netMarginPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 1000) / 10 : 0;

    return {
      startDate: filterStart.toISOString(),
      endDate: filterEnd.toISOString(),
      revenue: {
        grossSales: Math.round(totalRevenue * 100) / 100,
        subtotal: Math.round((salesAggr._sum.subtotal || 0) * 100) / 100,
        taxCollected: Math.round((salesAggr._sum.taxAmount || 0) * 100) / 100,
        totalDiscounts: Math.round((salesAggr._sum.discount || 0) * 100) / 100,
        orderCount: salesAggr._count.id || 0
      },
      costOfGoodsSold: Math.round(totalCogs * 100) / 100,
      grossProfit,
      grossMarginPercent,
      operatingExpenses: {
        total: Math.round(totalExpenses * 100) / 100,
        breakdown: expenseByCategory
      },
      netProfit,
      netMarginPercent
    };
  }

  async getStockReport() {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { stockQuantity: 'asc' }
    });

    let totalStockUnits = 0;
    let totalValuationCost = 0;
    let totalValuationRetail = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const categoryStats = {};

    for (const p of products) {
      const units = p.stockQuantity;
      const costValue = units * p.purchasePrice;
      const retailValue = units * p.sellingPrice;

      totalStockUnits += units;
      totalValuationCost += costValue;
      totalValuationRetail += retailValue;

      if (units <= 0) outOfStockCount++;
      else if (units <= p.reorderLevel) lowStockCount++;

      const catName = p.category?.name || 'Uncategorized';
      if (!categoryStats[catName]) {
        categoryStats[catName] = { units: 0, costVal: 0, retailVal: 0, count: 0 };
      }
      categoryStats[catName].units += units;
      categoryStats[catName].costVal += costValue;
      categoryStats[catName].retailVal += retailValue;
      categoryStats[catName].count += 1;
    }

    const potentialProfit = totalValuationRetail - totalValuationCost;

    return {
      totalProducts: products.length,
      totalStockUnits,
      lowStockCount,
      outOfStockCount,
      totalValuationCost: Math.round(totalValuationCost * 100) / 100,
      totalValuationRetail: Math.round(totalValuationRetail * 100) / 100,
      potentialProfit: Math.round(potentialProfit * 100) / 100,
      categoryStats: Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        productCount: stats.count,
        totalUnits: stats.units,
        costValue: Math.round(stats.costVal * 100) / 100,
        retailValue: Math.round(stats.retailVal * 100) / 100
      })),
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category?.name || '',
        stockQuantity: p.stockQuantity,
        reorderLevel: p.reorderLevel,
        unit: p.unit,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        stockValuationCost: Math.round(p.stockQuantity * p.purchasePrice * 100) / 100,
        stockValuationRetail: Math.round(p.stockQuantity * p.sellingPrice * 100) / 100,
        isLowStock: p.stockQuantity <= p.reorderLevel
      }))
    };
  }

  async getCustomerDuesReport() {
    const customersWithDues = await prisma.customer.findMany({
      where: { outstandingBalance: { gt: 0 } },
      include: {
        sales: {
          where: { balanceAmount: { gt: 0 } },
          select: { id: true, invoiceNumber: true, grandTotal: true, balanceAmount: true, createdAt: true }
        }
      },
      orderBy: { outstandingBalance: 'desc' }
    });

    const totalReceivables = customersWithDues.reduce((acc, c) => acc + c.outstandingBalance, 0);

    return {
      totalReceivables: Math.round(totalReceivables * 100) / 100,
      customerCount: customersWithDues.length,
      customers: customersWithDues.map(c => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        outstandingBalance: c.outstandingBalance,
        pendingInvoicesCount: c.sales.length,
        invoices: c.sales
      }))
    };
  }

  async exportToCSV(type) {
    if (type === 'sales') {
      const sales = await prisma.sale.findMany({
        include: { customer: true, createdByUser: true },
        orderBy: { createdAt: 'desc' }
      });
      const header = 'Invoice Number,Date,Customer,Subtotal,Tax,Discount,Grand Total,Paid,Balance,Payment Mode,Status\n';
      const rows = sales.map(s =>
        `"${s.invoiceNumber}","${s.createdAt.toISOString().slice(0, 10)}","${s.customer?.name || 'Walk-in'}",${s.subtotal},${s.taxAmount},${s.discount},${s.grandTotal},${s.paidAmount},${s.balanceAmount},"${s.paymentMode}","${s.paymentStatus}"`
      ).join('\n');
      return header + rows;
    }

    if (type === 'stock') {
      const products = await prisma.product.findMany({
        include: { category: true },
        orderBy: { name: 'asc' }
      });
      const header = 'Name,SKU,Barcode,Category,Stock Qty,Unit,Cost Price,Selling Price,Stock Value (Cost),Stock Value (Retail)\n';
      const rows = products.map(p =>
        `"${p.name}","${p.sku}","${p.barcode || ''}","${p.category?.name || ''}",${p.stockQuantity},"${p.unit}",${p.purchasePrice},${p.sellingPrice},${Math.round(p.stockQuantity * p.purchasePrice * 100) / 100},${Math.round(p.stockQuantity * p.sellingPrice * 100) / 100}`
      ).join('\n');
      return header + rows;
    }

    if (type === 'expenses') {
      const expenses = await prisma.expense.findMany({
        include: { recordedByUser: true },
        orderBy: { date: 'desc' }
      });
      const header = 'Title,Category,Amount,Date,Payment Mode,Notes,Recorded By\n';
      const rows = expenses.map(e =>
        `"${e.title}","${e.category}",${e.amount},"${e.date.toISOString().slice(0, 10)}","${e.paymentMode}","${e.notes || ''}","${e.recordedByUser?.name || ''}"`
      ).join('\n');
      return header + rows;
    }

    if (type === 'customer-dues') {
      const customers = await prisma.customer.findMany({
        where: { outstandingBalance: { gt: 0 } },
        orderBy: { outstandingBalance: 'desc' }
      });
      const header = 'Customer Name,Phone,Email,Loyalty Points,Outstanding Balance\n';
      const rows = customers.map(c =>
        `"${c.name}","${c.phone || ''}","${c.email || ''}",${c.loyaltyPoints},${c.outstandingBalance}`
      ).join('\n');
      return header + rows;
    }

    throw new Error(`Unsupported export type: ${type}`);
  }
}

module.exports = new ReportService();
