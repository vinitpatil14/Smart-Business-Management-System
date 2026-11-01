const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const salesRoutes = require('./salesRoutes');
const purchaseRoutes = require('./purchaseRoutes');
const customerRoutes = require('./customerRoutes');
const expenseRoutes = require('./expenseRoutes');
const employeeRoutes = require('./employeeRoutes');
const reportRoutes = require('./reportRoutes');
const smartRoutes = require('./smartRoutes');

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales', salesRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/customers', customerRoutes);
router.use('/expenses', expenseRoutes);
router.use('/employees', employeeRoutes);
router.use('/reports', reportRoutes);
router.use('/smart', smartRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'SBMS Backend API', timestamp: new Date() });
});

module.exports = router;
