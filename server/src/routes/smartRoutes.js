const express = require('express');
const router = express.Router();
const smartController = require('../controllers/smartController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/low-stock-prediction', smartController.getLowStockPredictions);
router.get('/product-insights', smartController.getProductInsights);
router.get('/payment-reminders', smartController.getPaymentReminders);

module.exports = router;
