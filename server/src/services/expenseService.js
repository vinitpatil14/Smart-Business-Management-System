const prisma = require('../config/db');

class ExpenseService {
  async getExpenses({ page = 1, limit = 10, category, startDate, endDate }) {
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = {};
    if (category) {
      where.category = category;
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const [totalCount, expenses] = await Promise.all([
      prisma.expense.count({ where }),
      prisma.expense.findMany({
        where,
        include: {
          recordedByUser: { select: { id: true, name: true } }
        },
        orderBy: { date: 'desc' },
        skip,
        take
      })
    ]);

    return {
      expenses,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    };
  }

  async getSummary() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

    const [allTimeSum, monthSum, byCategory] = await Promise.all([
      prisma.expense.aggregate({ _sum: { amount: true } }),
      prisma.expense.aggregate({
        where: { date: { gte: startOfMonth } },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.expense.groupBy({
        by: ['category'],
        _sum: { amount: true },
        _count: { id: true }
      })
    ]);

    return {
      totalAmount: allTimeSum._sum.amount || 0,
      currentMonthAmount: monthSum._sum.amount || 0,
      currentMonthCount: monthSum._count.id || 0,
      byCategory: byCategory.map(b => ({
        category: b.category,
        total: b._sum.amount || 0,
        count: b._count.id
      }))
    };
  }

  async createExpense(data, userId) {
    return prisma.expense.create({
      data: {
        title: data.title,
        category: data.category || 'OTHER',
        amount: parseFloat(data.amount),
        date: data.date ? new Date(data.date) : new Date(),
        paymentMode: data.paymentMode || 'CASH',
        notes: data.notes || null,
        recordedByUserId: userId ? Number(userId) : null
      },
      include: {
        recordedByUser: { select: { id: true, name: true } }
      }
    });
  }

  async updateExpense(id, data) {
    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.amount !== undefined) updateData.amount = parseFloat(data.amount);
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.paymentMode !== undefined) updateData.paymentMode = data.paymentMode;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return prisma.expense.update({
      where: { id: Number(id) },
      data: updateData,
      include: { recordedByUser: { select: { id: true, name: true } } }
    });
  }

  async deleteExpense(id) {
    return prisma.expense.delete({
      where: { id: Number(id) }
    });
  }
}

module.exports = new ExpenseService();
