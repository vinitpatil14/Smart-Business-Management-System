const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning existing records ---');
  await prisma.attendance.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  console.log('--- Seeding Users ---');
  const passwordHash = await bcrypt.hash('admin123', 10);
  const managerHash = await bcrypt.hash('manager123', 10);
  const staffHash = await bcrypt.hash('staff123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@sbms.com',
      password: passwordHash,
      role: 'ADMIN',
      phone: '+91 98765 43210',
      status: 'ACTIVE'
    }
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Operations Manager',
      email: 'manager@sbms.com',
      password: managerHash,
      role: 'MANAGER',
      phone: '+91 98765 43211',
      status: 'ACTIVE'
    }
  });

  const staff = await prisma.user.create({
    data: {
      name: 'Sales Staff',
      email: 'staff@sbms.com',
      password: staffHash,
      role: 'STAFF',
      phone: '+91 98765 43212',
      status: 'ACTIVE'
    }
  });

  console.log('--- Seeding Categories ---');
  const catElectronics = await prisma.category.create({
    data: { name: 'Electronics & Hardware', description: 'Gadgets, components, peripherals and accessories' }
  });
  const catGroceries = await prisma.category.create({
    data: { name: 'Packaged Goods & Beverages', description: 'Packaged consumer retail essentials' }
  });
  const catTools = await prisma.category.create({
    data: { name: 'Industrial Tools & Hardware', description: 'Tools, fasteners, protective equipment' }
  });
  const catStationery = await prisma.category.create({
    data: { name: 'Office Stationery', description: 'Paper, writing instruments, desk essentials' }
  });

  console.log('--- Seeding Products ---');
  const productsData = [
    {
      name: 'Wireless Bluetooth Mouse',
      sku: 'ELEC-MOU-001',
      barcode: '890123456701',
      categoryId: catElectronics.id,
      purchasePrice: 350.0,
      sellingPrice: 650.0,
      stockQuantity: 45,
      reorderLevel: 15,
      unit: 'pcs'
    },
    {
      name: 'USB-C Fast Charging Cable 2M',
      sku: 'ELEC-CAB-002',
      barcode: '890123456702',
      categoryId: catElectronics.id,
      purchasePrice: 120.0,
      sellingPrice: 299.0,
      stockQuantity: 8, // Low stock on purpose
      reorderLevel: 20,
      unit: 'pcs'
    },
    {
      name: '1080p FHD Web Camera',
      sku: 'ELEC-CAM-003',
      barcode: '890123456703',
      categoryId: catElectronics.id,
      purchasePrice: 1100.0,
      sellingPrice: 1850.0,
      stockQuantity: 24,
      reorderLevel: 10,
      unit: 'pcs'
    },
    {
      name: 'Premium Roast Coffee Beans 500g',
      sku: 'GROC-COF-001',
      barcode: '890123456704',
      categoryId: catGroceries.id,
      purchasePrice: 280.0,
      sellingPrice: 480.0,
      stockQuantity: 5, // Low stock on purpose
      reorderLevel: 15,
      unit: 'box'
    },
    {
      name: 'Green Tea Extract Bags 100pk',
      sku: 'GROC-TEA-002',
      barcode: '890123456705',
      categoryId: catGroceries.id,
      purchasePrice: 190.0,
      sellingPrice: 350.0,
      stockQuantity: 32,
      reorderLevel: 10,
      unit: 'box'
    },
    {
      name: 'Heavy Duty Digital Caliper 150mm',
      sku: 'TOOL-CAL-001',
      barcode: '890123456706',
      categoryId: catTools.id,
      purchasePrice: 650.0,
      sellingPrice: 1200.0,
      stockQuantity: 18,
      reorderLevel: 8,
      unit: 'pcs'
    },
    {
      name: 'Impact Screwdriver Bit Set (32 Pcs)',
      sku: 'TOOL-BIT-002',
      barcode: '890123456707',
      categoryId: catTools.id,
      purchasePrice: 420.0,
      sellingPrice: 799.0,
      stockQuantity: 6, // Low stock on purpose
      reorderLevel: 12,
      unit: 'set'
    },
    {
      name: 'A4 Copier Paper 75GSM (500 Sheets)',
      sku: 'STAT-PPR-001',
      barcode: '890123456708',
      categoryId: catStationery.id,
      purchasePrice: 210.0,
      sellingPrice: 340.0,
      stockQuantity: 70,
      reorderLevel: 25,
      unit: 'ream'
    },
    {
      name: 'Executive Gel Pens (Pack of 10)',
      sku: 'STAT-PEN-002',
      barcode: '890123456709',
      categoryId: catStationery.id,
      purchasePrice: 90.0,
      sellingPrice: 180.0,
      stockQuantity: 95,
      reorderLevel: 20,
      unit: 'pack'
    },
    {
      name: 'Surge Protector 6-Socket Power Strip',
      sku: 'ELEC-PWR-004',
      barcode: '890123456710',
      categoryId: catElectronics.id,
      purchasePrice: 500.0,
      sellingPrice: 890.0,
      stockQuantity: 3, // Critical low stock
      reorderLevel: 10,
      unit: 'pcs'
    }
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const prod = await prisma.product.create({ data: p });
    createdProducts.push(prod);
  }

  console.log('--- Seeding Customers ---');
  const customersData = [
    {
      name: 'Apex Infotech Solutions',
      phone: '9820011223',
      email: 'procurement@apexinfo.com',
      address: 'Plot 42, Tech Park, Sector 5, Navi Mumbai',
      loyaltyPoints: 180,
      outstandingBalance: 1250.0
    },
    {
      name: 'Rajesh Sharma (Retail Walk-in)',
      phone: '9819922334',
      email: 'rajesh.sharma@gmail.com',
      address: 'Flat 304, Green Heights, Andheri East',
      loyaltyPoints: 45,
      outstandingBalance: 0.0
    },
    {
      name: 'BuildCraft Engineering Works',
      phone: '9833344556',
      email: 'orders@buildcraft.in',
      address: 'Gala 12, Industrial Estate, Thane West',
      loyaltyPoints: 320,
      outstandingBalance: 4800.0
    },
    {
      name: 'Pooja Enterprises',
      phone: '9877788990',
      email: 'pooja.enterprises@yahoo.com',
      address: 'Shop 8, Station Road, Borivali',
      loyaltyPoints: 95,
      outstandingBalance: 650.0
    },
    {
      name: 'Zenith Design Studio',
      phone: '9844455667',
      email: 'contact@zenithstudio.com',
      address: 'Studio 3B, Bandra Kurla Complex, Mumbai',
      loyaltyPoints: 120,
      outstandingBalance: 0.0
    }
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    const cust = await prisma.customer.create({ data: c });
    createdCustomers.push(cust);
  }

  console.log('--- Seeding Suppliers ---');
  const suppliersData = [
    {
      name: 'MicroTech Hardware Wholesale Ltd',
      contactPerson: 'Vikas Agarwal',
      phone: '9821098765',
      email: 'sales@microtechhw.com',
      address: 'Lamington Road, Grant Road, Mumbai',
      gstNumber: '27AABCM1234P1Z2',
      balanceDue: 8500.0
    },
    {
      name: 'National Stationery Mart',
      contactPerson: 'Sunil Mehta',
      phone: '9833012345',
      email: 'supply@nationalstationery.com',
      address: 'Fort Commercial Area, Mumbai',
      gstNumber: '27AABCN5678Q1Z4',
      balanceDue: 0.0
    },
    {
      name: 'ProTool Manufacturing Co',
      contactPerson: 'Harish Rao',
      phone: '9844098765',
      email: 'info@protoolsmfg.in',
      address: 'MIDC Industrial Area, Bhosari, Pune',
      gstNumber: '27AABCP9012R1Z8',
      balanceDue: 3400.0
    },
    {
      name: 'Global Agro & Foods Supply',
      contactPerson: 'Anjali Verma',
      phone: '9855012345',
      email: 'orders@globalagro.com',
      address: 'APMC Market, Vashi, Navi Mumbai',
      gstNumber: '27AABCQ3456S1Z0',
      balanceDue: 1200.0
    }
  ];

  const createdSuppliers = [];
  for (const s of suppliersData) {
    const sup = await prisma.supplier.create({ data: s });
    createdSuppliers.push(sup);
  }

  console.log('--- Seeding Purchases ---');
  const purchase1 = await prisma.purchase.create({
    data: {
      purchaseNumber: 'PO-2026-001',
      supplierId: createdSuppliers[0].id,
      subtotal: 18500.0,
      taxAmount: 3330.0,
      grandTotal: 21830.0,
      paidAmount: 13330.0,
      balanceAmount: 8500.0,
      paymentStatus: 'PARTIAL',
      notes: 'Initial restock of computer peripherals',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            quantity: 30,
            unitPrice: 350.0,
            total: 10500.0
          },
          {
            productId: createdProducts[2].id,
            quantity: 10,
            unitPrice: 800.0,
            total: 8000.0
          }
        ]
      }
    }
  });

  const purchase2 = await prisma.purchase.create({
    data: {
      purchaseNumber: 'PO-2026-002',
      supplierId: createdSuppliers[1].id,
      subtotal: 12600.0,
      taxAmount: 1512.0,
      grandTotal: 14112.0,
      paidAmount: 14112.0,
      balanceAmount: 0.0,
      paymentStatus: 'PAID',
      notes: 'Bulk purchase of copier paper & executive pens',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      items: {
        create: [
          {
            productId: createdProducts[7].id,
            quantity: 40,
            unitPrice: 210.0,
            total: 8400.0
          },
          {
            productId: createdProducts[8].id,
            quantity: 50,
            unitPrice: 84.0,
            total: 4200.0
          }
        ]
      }
    }
  });

  console.log('--- Seeding Sales & POS Invoices ---');
  // Past 7 days sales data for charts & smart predictions
  const daysAgo = (days, hours = 0) => new Date(Date.now() - (days * 24 - hours) * 60 * 60 * 1000);

  const salesData = [
    {
      invoiceNumber: 'INV-2026-101',
      customerId: createdCustomers[0].id,
      subtotal: 3950.0,
      taxPercent: 18.0,
      taxAmount: 711.0,
      discount: 200.0,
      grandTotal: 4461.0,
      paidAmount: 3211.0,
      balanceAmount: 1250.0,
      paymentMode: 'CREDIT',
      paymentStatus: 'PARTIAL',
      createdByUserId: staff.id,
      createdAt: daysAgo(6, 4),
      items: [
        { productId: createdProducts[0].id, quantity: 3, unitPrice: 650.0, total: 1950.0 },
        { productId: createdProducts[1].id, quantity: 5, unitPrice: 299.0, total: 1495.0 },
        { productId: createdProducts[8].id, quantity: 3, unitPrice: 180.0, total: 540.0 }
      ]
    },
    {
      invoiceNumber: 'INV-2026-102',
      customerId: createdCustomers[1].id,
      subtotal: 1850.0,
      taxPercent: 18.0,
      taxAmount: 333.0,
      discount: 50.0,
      grandTotal: 2133.0,
      paidAmount: 2133.0,
      balanceAmount: 0.0,
      paymentMode: 'UPI',
      paymentStatus: 'PAID',
      createdByUserId: staff.id,
      createdAt: daysAgo(5, 2),
      items: [
        { productId: createdProducts[2].id, quantity: 1, unitPrice: 1850.0, total: 1850.0 }
      ]
    },
    {
      invoiceNumber: 'INV-2026-103',
      customerId: createdCustomers[2].id,
      subtotal: 6798.0,
      taxPercent: 18.0,
      taxAmount: 1223.64,
      discount: 300.0,
      grandTotal: 7721.64,
      paidAmount: 2921.64,
      balanceAmount: 4800.0,
      paymentMode: 'CREDIT',
      paymentStatus: 'PARTIAL',
      createdByUserId: manager.id,
      createdAt: daysAgo(4, 6),
      items: [
        { productId: createdProducts[5].id, quantity: 4, unitPrice: 1200.0, total: 4800.0 },
        { productId: createdProducts[6].id, quantity: 2, unitPrice: 799.0, total: 1598.0 },
        { productId: createdProducts[7].id, quantity: 1, unitPrice: 340.0, total: 340.0 }
      ]
    },
    {
      invoiceNumber: 'INV-2026-104',
      customerId: createdCustomers[3].id,
      subtotal: 2470.0,
      taxPercent: 12.0,
      taxAmount: 296.4,
      discount: 100.0,
      grandTotal: 2666.4,
      paidAmount: 2016.4,
      balanceAmount: 650.0,
      paymentMode: 'CARD',
      paymentStatus: 'PARTIAL',
      createdByUserId: staff.id,
      createdAt: daysAgo(2, 5),
      items: [
        { productId: createdProducts[3].id, quantity: 3, unitPrice: 480.0, total: 1440.0 },
        { productId: createdProducts[4].id, quantity: 2, unitPrice: 350.0, total: 700.0 },
        { productId: createdProducts[7].id, quantity: 1, unitPrice: 340.0, total: 340.0 }
      ]
    },
    {
      invoiceNumber: 'INV-2026-105',
      customerId: createdCustomers[4].id,
      subtotal: 3120.0,
      taxPercent: 18.0,
      taxAmount: 561.6,
      discount: 150.0,
      grandTotal: 3531.6,
      paidAmount: 3531.6,
      balanceAmount: 0.0,
      paymentMode: 'UPI',
      paymentStatus: 'PAID',
      createdByUserId: admin.id,
      createdAt: daysAgo(1, 3),
      items: [
        { productId: createdProducts[0].id, quantity: 2, unitPrice: 650.0, total: 1300.0 },
        { productId: createdProducts[9].id, quantity: 1, unitPrice: 890.0, total: 890.0 },
        { productId: createdProducts[7].id, quantity: 2, unitPrice: 340.0, total: 680.0 }
      ]
    },
    {
      invoiceNumber: 'INV-2026-106',
      customerId: createdCustomers[1].id,
      subtotal: 1740.0,
      taxPercent: 18.0,
      taxAmount: 313.2,
      discount: 50.0,
      grandTotal: 2003.2,
      paidAmount: 2003.2,
      balanceAmount: 0.0,
      paymentMode: 'CASH',
      paymentStatus: 'PAID',
      createdByUserId: staff.id,
      createdAt: daysAgo(0, 2), // Today
      items: [
        { productId: createdProducts[0].id, quantity: 2, unitPrice: 650.0, total: 1300.0 },
        { productId: createdProducts[8].id, quantity: 2, unitPrice: 180.0, total: 360.0 }
      ]
    },
    {
      invoiceNumber: 'INV-2026-107',
      customerId: null, // Walk in guest customer
      subtotal: 1199.0,
      taxPercent: 18.0,
      taxAmount: 215.82,
      discount: 0.0,
      grandTotal: 1414.82,
      paidAmount: 1414.82,
      balanceAmount: 0.0,
      paymentMode: 'UPI',
      paymentStatus: 'PAID',
      createdByUserId: staff.id,
      createdAt: daysAgo(0, 1), // Today
      items: [
        { productId: createdProducts[1].id, quantity: 1, unitPrice: 299.0, total: 299.0 },
        { productId: createdProducts[9].id, quantity: 1, unitPrice: 890.0, total: 890.0 }
      ]
    }
  ];

  for (const s of salesData) {
    const { items, ...saleHeader } = s;
    await prisma.sale.create({
      data: {
        ...saleHeader,
        items: {
          create: items.map(it => ({
            productId: it.productId,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            total: it.total
          }))
        }
      }
    });
  }

  console.log('--- Seeding Expenses ---');
  const expensesData = [
    {
      title: 'Store Front & Warehouse Rent',
      category: 'RENT',
      amount: 35000.0,
      date: daysAgo(10),
      paymentMode: 'BANK_TRANSFER',
      notes: 'Monthly rental paid via NEFT to landlord',
      recordedByUserId: admin.id
    },
    {
      title: 'High-Speed Commercial Fiber Internet',
      category: 'UTILITIES',
      amount: 1499.0,
      date: daysAgo(8),
      paymentMode: 'UPI',
      notes: 'Tata Tele broadband bill',
      recordedByUserId: manager.id
    },
    {
      title: 'Electricity & Air Conditioning Bill',
      category: 'UTILITIES',
      amount: 5840.0,
      date: daysAgo(5),
      paymentMode: 'UPI',
      notes: 'Adani Electricity monthly bill',
      recordedByUserId: manager.id
    },
    {
      title: 'Packaging Boxes & Bubble Wrap Roll',
      category: 'SUPPLIES',
      amount: 2350.0,
      date: daysAgo(3),
      paymentMode: 'CASH',
      notes: 'Dispatch supplies replenishment',
      recordedByUserId: staff.id
    },
    {
      title: 'Local Google Ads & Social Campaign',
      category: 'MARKETING',
      amount: 4500.0,
      date: daysAgo(2),
      paymentMode: 'CARD',
      notes: 'Festive promotion boost',
      recordedByUserId: admin.id
    }
  ];

  for (const exp of expensesData) {
    await prisma.expense.create({ data: exp });
  }

  console.log('--- Seeding Employees & Attendance ---');
  const employeesData = [
    {
      name: 'Ramesh Kulkarni',
      email: 'ramesh.k@sbms.com',
      phone: '9811223344',
      designation: 'Inventory & Warehouse Lead',
      department: 'Logistics',
      baseSalary: 32000.0,
      status: 'ACTIVE'
    },
    {
      name: 'Sneha Patil',
      email: 'sneha.p@sbms.com',
      phone: '9822334455',
      designation: 'Senior POS Billing Cashier',
      department: 'Sales',
      baseSalary: 25000.0,
      status: 'ACTIVE'
    },
    {
      name: 'Amit Deshmukh',
      email: 'amit.d@sbms.com',
      phone: '9833445566',
      designation: 'Accounts & Compliance Executive',
      department: 'Finance',
      baseSalary: 30000.0,
      status: 'ACTIVE'
    },
    {
      name: 'Deepak Yadav',
      email: 'deepak.y@sbms.com',
      phone: '9844556677',
      designation: 'Field Dispatch & Delivery Associate',
      department: 'Logistics',
      baseSalary: 20000.0,
      status: 'ACTIVE'
    }
  ];

  for (const empData of employeesData) {
    const emp = await prisma.employee.create({ data: empData });

    // Seed attendance for the last 5 days
    for (let day = 0; day < 5; day++) {
      const attendanceDate = new Date();
      attendanceDate.setDate(attendanceDate.getDate() - day);
      attendanceDate.setHours(0, 0, 0, 0);

      let status = 'PRESENT';
      if (emp.name.includes('Deepak') && day === 1) status = 'LEAVE';
      if (emp.name.includes('Sneha') && day === 3) status = 'HALF_DAY';

      await prisma.attendance.create({
        data: {
          employeeId: emp.id,
          date: attendanceDate,
          status,
          notes: status === 'PRESENT' ? 'On time' : `${status} recorded`
        }
      });
    }
  }

  console.log('=== Database seeded successfully! ===');
  console.log('Admin user: admin@sbms.com / admin123');
  console.log('Manager user: manager@sbms.com / manager123');
  console.log('Staff user: staff@sbms.com / staff123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
