const prisma = require('../config/db');
const { isDemoUser } = require('../utils/userScope');

class CustomerService {
  async getCustomers({ page = 1, limit = 10, search = '' }, user) {
    const isDemo = isDemoUser(user);
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const where = {};
    if (!isDemo) {
      where.id = { gt: 6 };
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
            { email: { contains: search } }
          ]
        }
      ];
    }

    const [totalCount, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        include: {
          _count: { select: { sales: true } }
        },
        orderBy: { name: 'asc' },
        skip,
        take
      })
    ]);

    return {
      customers,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    };
  }

  async getAllCustomersList(user) {
    const isDemo = isDemoUser(user);
    const where = !isDemo ? { id: { gt: 6 } } : {};
    // Lightweight list for POS dropdowns
    return prisma.customer.findMany({
      where,
      select: { id: true, name: true, phone: true, loyaltyPoints: true, outstandingBalance: true },
      orderBy: { name: 'asc' }
    });
  }

  async getCustomerById(id) {
    const customer = await prisma.customer.findUnique({
      where: { id: Number(id) },
      include: {
        sales: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: { include: { product: true } }
          }
        }
      }
    });

    if (!customer) {
      const err = new Error('Customer not found');
      err.statusCode = 404;
      throw err;
    }

    return customer;
  }

  async createCustomer(data) {
    return prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        loyaltyPoints: parseInt(data.loyaltyPoints || 0),
        outstandingBalance: parseFloat(data.outstandingBalance || 0)
      }
    });
  }

  async updateCustomer(id, data) {
    return prisma.customer.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        loyaltyPoints: data.loyaltyPoints !== undefined ? parseInt(data.loyaltyPoints) : undefined,
        outstandingBalance: data.outstandingBalance !== undefined ? parseFloat(data.outstandingBalance) : undefined
      }
    });
  }

  async deleteCustomer(id) {
    return prisma.customer.delete({
      where: { id: Number(id) }
    });
  }
}

module.exports = new CustomerService();
