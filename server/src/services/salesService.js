const prisma = require('../config/db');

class SalesService {
  async createSale({
    customerId,
    items, // [{ productId, quantity, unitPrice }]
    taxPercent = 0,
    discount = 0,
    paymentMode = 'CASH',
    paidAmount = 0,
    notes = '',
    userId
  }) {
    if (!items || !items.length) {
      const err = new Error('Sale must contain at least one item');
      err.statusCode = 400;
      throw err;
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Validate products and stock
      let calculatedSubtotal = 0;
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
        if (qty <= 0) {
          const err = new Error(`Quantity for ${product.name} must be greater than 0`);
          err.statusCode = 400;
          throw err;
        }

        if (product.stockQuantity < qty) {
          const err = new Error(
            `Insufficient stock for '${product.name}'. Available: ${product.stockQuantity}, Requested: ${qty}`
          );
          err.statusCode = 400;
          throw err;
        }

        const price = item.unitPrice !== undefined ? parseFloat(item.unitPrice) : product.sellingPrice;
        const lineTotal = Math.round(price * qty * 100) / 100;
        calculatedSubtotal += lineTotal;

        verifiedItems.push({
          productId: product.id,
          productName: product.name,
          quantity: qty,
          unitPrice: price,
          total: lineTotal
        });

        // 2. Auto-deduct stock
        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: {
              decrement: qty
            }
          }
        });
      }

      // 3. Tax and total calculations
      const discountVal = parseFloat(discount) || 0;
      const taxableAmount = Math.max(0, calculatedSubtotal - discountVal);
      const taxRate = parseFloat(taxPercent) || 0;
      const taxAmount = Math.round((taxableAmount * (taxRate / 100)) * 100) / 100;
      const grandTotal = Math.round((taxableAmount + taxAmount) * 100) / 100;

      let paid = parseFloat(paidAmount);
      if (isNaN(paid) || paid < 0) paid = 0;

      // If full payment method like CASH/UPI/CARD and paid amount not explicitly reduced, default paid to grandTotal
      if (['CASH', 'UPI', 'CARD'].includes(paymentMode) && paid === 0) {
        paid = grandTotal;
      }

      let balance = Math.round(Math.max(0, grandTotal - paid) * 100) / 100;

      let paymentStatus = 'PAID';
      if (balance > 0 && paid > 0) {
        paymentStatus = 'PARTIAL';
      } else if (balance > 0 && paid === 0) {
        paymentStatus = 'DUE';
      }

      // 4. Generate unique invoice number
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const countToday = await tx.sale.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      });
      const invoiceNumber = `INV-${datePart}-${String(countToday + 1).padStart(4, '0')}`;

      // 5. Create Sale Record
      const sale = await tx.sale.create({
        data: {
          invoiceNumber,
          customerId: customerId ? Number(customerId) : null,
          subtotal: calculatedSubtotal,
          taxPercent: taxRate,
          taxAmount,
          discount: discountVal,
          grandTotal,
          paidAmount: paid,
          balanceAmount: balance,
          paymentMode,
          paymentStatus,
          notes: notes || null,
          createdByUserId: userId ? Number(userId) : null,
          items: {
            create: verifiedItems.map(it => ({
              productId: it.productId,
              quantity: it.quantity,
              unitPrice: it.unitPrice,
              total: it.total
            }))
          }
        },
        include: {
          items: { include: { product: true } },
          customer: true,
          createdByUser: { select: { id: true, name: true, email: true } }
        }
      });

      // 6. Update Customer Loyalty and Outstanding Balance if Customer attached
      if (customerId) {
        const loyaltyEarned = Math.floor(grandTotal / 100);
        await tx.customer.update({
          where: { id: Number(customerId) },
          data: {
            loyaltyPoints: { increment: loyaltyEarned },
            outstandingBalance: { increment: balance }
          }
        });
      }

      return sale;
    });
  }

  async getSales({ page = 1, limit = 10, search = '', paymentStatus, startDate, endDate }) {
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = {};
    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customer: { name: { contains: search } } },
        { customer: { phone: { contains: search } } }
      ];
    }
    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [totalCount, sales] = await Promise.all([
      prisma.sale.count({ where }),
      prisma.sale.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          createdByUser: { select: { id: true, name: true } },
          _count: { select: { items: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      })
    ]);

    return {
      sales,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    };
  }

  async getSaleById(id) {
    const sale = await prisma.sale.findUnique({
      where: { id: Number(id) },
      include: {
        customer: true,
        createdByUser: { select: { id: true, name: true, email: true } },
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, unit: true, category: { select: { name: true } } }
            }
          }
        }
      }
    });

    if (!sale) {
      const err = new Error('Invoice / Sale record not found');
      err.statusCode = 404;
      throw err;
    }

    return sale;
  }

  async recordPayment(id, { amount, paymentMode = 'CASH', notes }) {
    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      const err = new Error('Payment amount must be greater than 0');
      err.statusCode = 400;
      throw err;
    }

    return await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id: Number(id) },
        include: { customer: true }
      });

      if (!sale) {
        const err = new Error('Sale not found');
        err.statusCode = 404;
        throw err;
      }

      if (sale.balanceAmount <= 0) {
        const err = new Error('This invoice is already fully paid');
        err.statusCode = 400;
        throw err;
      }

      const actualPayment = Math.min(payAmount, sale.balanceAmount);
      const newPaid = Math.round((sale.paidAmount + actualPayment) * 100) / 100;
      const newBalance = Math.round((sale.balanceAmount - actualPayment) * 100) / 100;
      const newStatus = newBalance === 0 ? 'PAID' : 'PARTIAL';

      const updatedSale = await tx.sale.update({
        where: { id: Number(id) },
        data: {
          paidAmount: newPaid,
          balanceAmount: newBalance,
          paymentStatus: newStatus,
          notes: notes ? `${sale.notes ? sale.notes + ' | ' : ''}Payment of ₹${actualPayment} via ${paymentMode}: ${notes}` : sale.notes
        },
        include: { customer: true, items: { include: { product: true } } }
      });

      if (sale.customerId) {
        await tx.customer.update({
          where: { id: sale.customerId },
          data: {
            outstandingBalance: { decrement: actualPayment }
          }
        });
      }

      return updatedSale;
    });
  }
}

module.exports = new SalesService();
