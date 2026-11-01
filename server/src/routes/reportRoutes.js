const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/sales', reportController.getSalesReport);
router.get('/profit-loss', authorize('ADMIN', 'MANAGER'), reportController.getProfitLossReport);
router.get('/stock', reportController.getStockReport);
router.get('/customer-dues', reportController.getCustomerDuesReport);
router.get('/export/:type', reportController.exportReport);

module.exports = router;
