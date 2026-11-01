const prisma = require('../config/db');
const { isDemoUser } = require('../utils/userScope');

class InventoryService {
  // --- Products ---
  async getProducts({ page = 1, limit = 10, search = '', categoryId, lowStockOnly = false, showArchived = false }, user) {
    const isDemo = isDemoUser(user);
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = {};
    if (showArchived === true || showArchived === 'true') {
      where.isArchived = true;
    } else {
      where.isArchived = false;
    }

    // Scoping: Demo users see the demo catalog.
    // Real users start with a fresh slate (only products added beyond demo set, starting at 0).
    if (!isDemo) {
      where.id = { gt: 11 };
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search } },
            { sku: { contains: search } },
            { barcode: { contains: search } }
          ]
        }
      ];
    }
    if (categoryId) {
      where.categoryId = Number(categoryId);
    }

    const [totalCount, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take
      })
    ]);

    let finalProducts = products;
    if (lowStockOnly === true || lowStockOnly === 'true') {
      finalProducts = products.filter(p => p.stockQuantity <= p.reorderLevel);
    }

    return {
      products: finalProducts,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    };
  }

  async getProductById(id) {
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { category: true }
    });
    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }
    return product;
  }

  async createProduct(data) {
    let sku = data.sku;
    if (!sku) {
      // Auto generate SKU if omitted
      const prefix = data.name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'PRD');
      sku = `${prefix}-${Date.now().toString().slice(-6)}`;
    }

    return prisma.product.create({
      data: {
        name: data.name,
        sku,
        barcode: data.barcode || null,
        categoryId: Number(data.categoryId),
        purchasePrice: parseFloat(data.purchasePrice),
        sellingPrice: parseFloat(data.sellingPrice),
        stockQuantity: parseInt(data.stockQuantity || 0),
        reorderLevel: parseInt(data.reorderLevel || 10),
        unit: data.unit || 'pcs'
      },
      include: { category: true }
    });
  }

  async updateProduct(id, data) {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.sku !== undefined) updateData.sku = data.sku;
    if (data.barcode !== undefined) updateData.barcode = data.barcode || null;
    if (data.categoryId !== undefined) updateData.categoryId = Number(data.categoryId);
    if (data.purchasePrice !== undefined) updateData.purchasePrice = parseFloat(data.purchasePrice);
    if (data.sellingPrice !== undefined) updateData.sellingPrice = parseFloat(data.sellingPrice);
    if (data.stockQuantity !== undefined) updateData.stockQuantity = parseInt(data.stockQuantity);
    if (data.reorderLevel !== undefined) updateData.reorderLevel = parseInt(data.reorderLevel);
    if (data.unit !== undefined) updateData.unit = data.unit;

    return prisma.product.update({
      where: { id: Number(id) },
      data: updateData,
      include: { category: true }
    });
  }

  async deleteProduct(id, force = false) {
    const prodId = Number(id);

    const product = await prisma.product.findUnique({
      where: { id: prodId }
    });

    if (!product) {
      const err = new Error('Product not found');
      err.statusCode = 404;
      throw err;
    }

    // Check if the product has associated sales or purchases
    const [salesCount, purchaseCount] = await Promise.all([
      prisma.saleItem.count({ where: { productId: prodId } }),
      prisma.purchaseItem.count({ where: { productId: prodId } })
    ]);

    if (salesCount > 0 || purchaseCount > 0) {
      if (force === true || force === 'true') {
        // If force delete is explicitly requested by admin
        return await prisma.$transaction(async (tx) => {
          await tx.saleItem.deleteMany({ where: { productId: prodId } });
          await tx.purchaseItem.deleteMany({ where: { productId: prodId } });
          return tx.product.delete({ where: { id: prodId } });
        });
      } else {
        // Safe archival: preserve historical sales records & invoices intact
        const archived = await prisma.product.update({
          where: { id: prodId },
          data: { isArchived: true }
        });
        return {
          ...archived,
          isArchived: true,
          message: `Product '${product.name}' is referenced in past sales/purchases. It has been safely archived and hidden from your active catalog and POS.`
        };
      }
    }

    // No transaction history, safe to permanently delete
    return prisma.product.delete({
      where: { id: prodId }
    });
  }

  async restoreProduct(id) {
    return prisma.product.update({
      where: { id: Number(id) },
      data: { isArchived: false }
    });
  }

  async getLowStockAlerts() {
    const products = await prisma.product.findMany({
      where: { isArchived: false },
      include: { category: true },
      orderBy: { stockQuantity: 'asc' }
    });
    return products.filter(p => p.stockQuantity <= p.reorderLevel);
  }

  // --- Categories ---
  async getCategories() {
    return prisma.category.findMany({
      include: {
        _count: { select: { products: true } }
      },
      orderBy: { name: 'asc' }
    });
  }

  async createCategory(data) {
    return prisma.category.create({
      data: {
        name: data.name,
        description: data.description || null
      }
    });
  }

  async updateCategory(id, data) {
    return prisma.category.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        description: data.description || null
      }
    });
  }

  async deleteCategory(id) {
    return prisma.category.delete({
      where: { id: Number(id) }
    });
  }
}

module.exports = new InventoryService();
