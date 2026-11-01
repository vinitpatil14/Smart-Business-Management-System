const prisma = require('../config/db');
const { isDemoUser } = require('../utils/userScope');

class PurchaseService {
  // --- Suppliers ---
  async getSuppliers({ search = '' } = {}, user) {
    const isDemo = isDemoUser(user);
    const where = {};
    if (!isDemo) {
      where.id = { gt: 4 };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contactPerson: { contains: search } },
        { phone: { contains: search } },
        { gstNumber: { contains: search } }
      ];
    }

    return prisma.supplier.findMany({
      where,
      include: {
        _count: { select: { purchases: true } }
      },
      orderBy: { name: 'asc' }
    });
  }

  async getSupplierById(id) {
    const supplier = await prisma.supplier.findUnique({
      where: { id: Number(id) },
      include: {
        purchases: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { items: { include: { product: true } } }
        }
      }
    });

    if (!supplier) {
      const err = new Error('Supplier not found');
      err.statusCode = 404;
      throw err;
    }

    return supplier;
  }

  async createSupplier(data) {
    return prisma.supplier.create({
      data: {
        name: data.name,
        contactPerson: data.contactPerson || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        gstNumber: data.gstNumber || null,
        balanceDue: parseFloat(data.balanceDue || 0)
      }
    });
  }

  async updateSupplier(id, data) {
    return prisma.supplier.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        contactPerson: data.contactPerson || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        gstNumber: data.gstNumber || null,
        balanceDue: data.balanceDue !== undefined ? parseFloat(data.balanceDue) : undefined
      }
    });
  }

  async deleteSupplier(id) {
    return prisma.supplier.delete({
      where: { id: Number(id) }
    });
  }

  // --- Purchases ---
  async createPurchase({ supplierId, items, taxAmount = 0, paidAmount = 0, notes }) {
    if (!supplierId || !items || !items.length) {
      const err = new Error('Supplier and at least one purchase item are required');
      err.statusCode = 400;
      throw err;
    }

    return await prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.findUnique({
        where: { id: Number(supplierId) }
      });
      if (!supplier) {
        const err = new Error('Supplier not found');
        err.statusCode = 404;
        throw err;
      }

      let subtotal = 0;
      const verifiedItems = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: Number(item.productId) }
        });
        if (!product) {
          const err = new Error(`Product with ID ${item.productId} not found`);
          err.statusCode = 404;
          throw err;
        }

        const qty = parseInt(item.quantity);
        const price = parseFloat(item.unitPrice);
        const lineTotal = Math.round(qty * price * 100) / 100;
        subtotal += lineTotal;

        verifiedItems.push({
          productId: product.id,
          quantity: qty,
          unitPrice: price,
          total: lineTotal
        });

        // Auto-increase stock quantity and update purchase price
        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: { increment: qty },
            purchasePrice: price
          }
        });
      }

      const tax = parseFloat(taxAmount) || 0;
      const grandTotal = Math.round((subtotal + tax) * 100) / 100;
      const paid = parseFloat(paidAmount) || 0;
      const balance = Math.round(Math.max(0, grandTotal - paid) * 100) / 100;

      let paymentStatus = 'PAID';
      if (balance > 0 && paid > 0) {
        paymentStatus = 'PARTIAL';
      } else if (balance > 0 && paid === 0) {
        paymentStatus = 'DUE';
      }

      // Generate unique PO number
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const count = await tx.purchase.count();
      const purchaseNumber = `PO-${datePart}-${String(count + 1).padStart(4, '0')}`;

      const purchase = await tx.purchase.create({
        data: {
          purchaseNumber,
          supplierId: Number(supplierId),
          subtotal,
          taxAmount: tax,
          grandTotal,
          paidAmount: paid,
          balanceAmount: balance,
          paymentStatus,
          notes: notes || null,
          items: {
            create: verifiedItems
          }
        },
        include: {
          supplier: true,
          items: { include: { product: true } }
        }
      });

      // Update supplier balance due if unpaid balance
      if (balance > 0) {
        await tx.supplier.update({
          where: { id: Number(supplierId) },
          data: {
            balanceDue: { increment: balance }
          }
        });
      }

      return purchase;
    });
  }

  async getPurchases({ page = 1, limit = 10, search = '', supplierId }, user) {
    const isDemo = isDemoUser(user);
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = {};
    if (!isDemo) {
      where.id = { gt: 3 };
    }
    if (search) {
      where.OR = [
        { purchaseNumber: { contains: search } },
        { supplier: { name: { contains: search } } }
      ];
    }
    if (supplierId) {
      where.supplierId = Number(supplierId);
    }

    const [totalCount, purchases] = await Promise.all([
      prisma.purchase.count({ where }),
      prisma.purchase.findMany({
        where,
        include: {
          supplier: { select: { id: true, name: true, phone: true } },
          _count: { select: { items: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      })
    ]);

    return {
      purchases,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    };
  }

  async getPurchaseById(id) {
    const purchase = await prisma.purchase.findUnique({
      where: { id: Number(id) },
      include: {
        supplier: true,
        items: {
          include: {
            product: { select: { id: true, name: true, sku: true, unit: true } }
          }
        }
      }
    });

    if (!purchase) {
      const err = new Error('Purchase entry not found');
      err.statusCode = 404;
      throw err;
    }

    return purchase;
  }

  async recordSupplierPayment(purchaseId, { amount, notes }) {
    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      const err = new Error('Payment amount must be greater than 0');
      err.statusCode = 400;
      throw err;
    }

    return await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUnique({
        where: { id: Number(purchaseId) }
      });

      if (!purchase) {
        const err = new Error('Purchase not found');
        err.statusCode = 404;
        throw err;
      }

      if (purchase.balanceAmount <= 0) {
        const err = new Error('This purchase is already fully settled');
        err.statusCode = 400;
        throw err;
      }

      const actualPayment = Math.min(payAmount, purchase.balanceAmount);
      const newPaid = Math.round((purchase.paidAmount + actualPayment) * 100) / 100;
      const newBalance = Math.round((purchase.balanceAmount - actualPayment) * 100) / 100;
      const newStatus = newBalance === 0 ? 'PAID' : 'PARTIAL';

      const updated = await tx.purchase.update({
        where: { id: Number(purchaseId) },
        data: {
          paidAmount: newPaid,
          balanceAmount: newBalance,
          paymentStatus: newStatus,
          notes: notes ? `${purchase.notes ? purchase.notes + ' | ' : ''}Paid ₹${actualPayment}: ${notes}` : purchase.notes
        },
        include: { supplier: true, items: { include: { product: true } } }
      });

      await tx.supplier.update({
        where: { id: purchase.supplierId },
        data: {
          balanceDue: { decrement: actualPayment }
        }
      });

      return updated;
    });
  }
}

module.exports = new PurchaseService();
