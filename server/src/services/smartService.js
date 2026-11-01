const prisma = require('../config/db');

class SmartService {
  /**
   * 1. Low-stock prediction based on recent sales trend
   * Calculates the daily sales burn rate over the last 14 days for each product
   * Computes:
   *  - averageDailyDemand (units/day)
   *  - daysOfStockLeft = stockQuantity / averageDailyDemand
   *  - stockoutRisk: 'CRITICAL' (< 3 days), 'HIGH' (3-7 days), 'MODERATE' (7-14 days), 'SAFE' (> 14 days)
   *  - recommendedReorderQty = (averageDailyDemand * 30 days buffer) - stockQuantity
   */
  async getLowStockPredictions() {
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const [products, saleItems] = await Promise.all([
      prisma.product.findMany({
        where: { isArchived: false },
        include: { category: true }
      }),
      prisma.saleItem.findMany({
        where: {
          sale: { createdAt: { gte: fourteenDaysAgo } }
        }
      })
    ]);

    // Aggregate sold units per product over the last 14 days
    const unitsSoldMap = {};
    for (const item of saleItems) {
      unitsSoldMap[item.productId] = (unitsSoldMap[item.productId] || 0) + item.quantity;
    }

    const predictions = products.map(p => {
      const soldLast14Days = unitsSoldMap[p.id] || 0;
      const dailyBurnRate = Math.round((soldLast14Days / 14) * 100) / 100;

      let daysRemaining;
      if (p.stockQuantity <= 0) {
        daysRemaining = 0;
      } else if (dailyBurnRate > 0) {
        daysRemaining = Math.round((p.stockQuantity / dailyBurnRate) * 10) / 10;
      } else {
        daysRemaining = 999; // No recent sales, stock not depleting rapidly
      }

      let riskLevel = 'SAFE';
      if (p.stockQuantity <= 0) {
        riskLevel = 'OUT_OF_STOCK';
      } else if (daysRemaining <= 3 || p.stockQuantity <= p.reorderLevel / 2) {
        riskLevel = 'CRITICAL';
      } else if (daysRemaining <= 7 || p.stockQuantity <= p.reorderLevel) {
        riskLevel = 'HIGH';
      } else if (daysRemaining <= 14) {
        riskLevel = 'MODERATE';
      }

      // 30 days buffer recommended reorder quantity
      const targetBufferQty = Math.max(p.reorderLevel * 2, Math.ceil(dailyBurnRate * 30));
      const recommendedReorder = Math.max(0, targetBufferQty - p.stockQuantity);

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category?.name || 'Uncategorized',
        stockQuantity: p.stockQuantity,
        reorderLevel: p.reorderLevel,
        unit: p.unit,
        soldLast14Days,
        dailyBurnRate,
        daysRemaining: daysRemaining === 999 ? '30+' : daysRemaining,
        riskLevel,
        recommendedReorder
      };
    });

    // Sort by risk priority
    const priorityOrder = { OUT_OF_STOCK: 0, CRITICAL: 1, HIGH: 2, MODERATE: 3, SAFE: 4 };
    predictions.sort((a, b) => priorityOrder[a.riskLevel] - priorityOrder[b.riskLevel]);

    const criticalCount = predictions.filter(p => ['OUT_OF_STOCK', 'CRITICAL', 'HIGH'].includes(p.riskLevel)).length;

    return {
      totalAnalyzed: products.length,
      criticalCount,
      predictions
    };
  }

  /**
   * 2. Best and Worst Selling Product Insights
   * Analyzes 30-day velocity, profit margin %, gross contribution, and identifies dead stock
   */
  async getProductInsights() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [products, saleItems] = await Promise.all([
      prisma.product.findMany({
        where: { isArchived: false },
        include: { category: true }
      }),
      prisma.saleItem.findMany({
        where: {
          sale: { createdAt: { gte: thirtyDaysAgo } }
        }
      })
    ]);

    const salesStats = {};
    for (const item of saleItems) {
      if (!salesStats[item.productId]) {
        salesStats[item.productId] = { units: 0, revenue: 0 };
      }
      salesStats[item.productId].units += item.quantity;
      salesStats[item.productId].revenue += item.total;
    }

    const analyzed = products.map(p => {
      const stats = salesStats[p.id] || { units: 0, revenue: 0 };
      const unitMargin = p.sellingPrice - p.purchasePrice;
      const marginPercent = p.sellingPrice > 0 ? Math.round((unitMargin / p.sellingPrice) * 1000) / 10 : 0;
      const grossContribution = Math.round(stats.units * unitMargin * 100) / 100;

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category?.name || 'Uncategorized',
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        stockQuantity: p.stockQuantity,
        unitMargin,
        marginPercent,
        unitsSold: stats.units,
        totalRevenue: Math.round(stats.revenue * 100) / 100,
        grossContribution,
        isDeadStock: stats.units === 0 && p.stockQuantity > 0
      };
    });

    // Top performers by sales volume
    const topPerformers = [...analyzed]
      .filter(p => p.unitsSold > 0)
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    // Top performers by profit margin
    const highMarginProducts = [...analyzed]
      .sort((a, b) => b.marginPercent - a.marginPercent)
      .slice(0, 5);

    // Slow moving / dead stock (zero sales in past 30 days with inventory sitting)
    const deadStock = analyzed
      .filter(p => p.isDeadStock)
      .sort((a, b) => b.stockQuantity - a.stockQuantity);

    return {
      topPerformers,
      highMarginProducts,
      deadStock,
      deadStockCount: deadStock.length
    };
  }

  /**
   * 3. Automatic reminders for pending customer payments
   * Retrieves customers with overdue or credit balances, calculates aging,
   * and prepares ready-to-send reminder messages.
   */
  async getPaymentReminders() {
    const customers = await prisma.customer.findMany({
      where: { outstandingBalance: { gt: 0 } },
      include: {
        sales: {
          where: { balanceAmount: { gt: 0 } },
          orderBy: { createdAt: 'asc' } // oldest unpaid invoice first
        }
      },
      orderBy: { outstandingBalance: 'desc' }
    });

    const now = Date.now();
    const reminders = customers.map(c => {
      const oldestInvoice = c.sales[0];
      const daysOverdue = oldestInvoice
        ? Math.floor((now - new Date(oldestInvoice.createdAt).getTime()) / (24 * 60 * 60 * 1000))
        : 0;

      let urgency = 'GENTLE';
      if (daysOverdue > 30) urgency = 'CRITICAL';
      else if (daysOverdue > 15) urgency = 'HIGH';
      else if (daysOverdue > 7) urgency = 'MODERATE';

      const invoiceListStr = c.sales.map(s => `${s.invoiceNumber} (₹${s.balanceAmount})`).join(', ');

      const message = `Dear ${c.name}, greetings from Smart Business Management. This is a gentle reminder regarding your outstanding balance of ₹${c.outstandingBalance.toFixed(2)}${oldestInvoice ? ` pending against invoice ${oldestInvoice.invoiceNumber}` : ''}. We kindly request you to clear the dues at your earliest convenience via UPI or Bank Transfer. Thank you for your continued business!`;

      return {
        customerId: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        outstandingBalance: c.outstandingBalance,
        pendingInvoicesCount: c.sales.length,
        oldestInvoiceNumber: oldestInvoice?.invoiceNumber || 'N/A',
        oldestInvoiceDate: oldestInvoice?.createdAt || null,
        daysOverdue,
        urgency,
        reminderMessage: message
      };
    });

    const totalDue = reminders.reduce((acc, r) => acc + r.outstandingBalance, 0);

    return {
      totalOutstanding: Math.round(totalDue * 100) / 100,
      totalCustomers: reminders.length,
      reminders
    };
  }
}

module.exports = new SmartService();
