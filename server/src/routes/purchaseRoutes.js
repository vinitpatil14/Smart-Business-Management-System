const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Suppliers
router.get('/suppliers', purchaseController.getSuppliers);
router.get('/suppliers/:id', purchaseController.getSupplierById);
router.post('/suppliers', authorize('ADMIN', 'MANAGER'), purchaseController.createSupplier);
router.put('/suppliers/:id', authorize('ADMIN', 'MANAGER'), purchaseController.updateSupplier);
router.delete('/suppliers/:id', authorize('ADMIN'), purchaseController.deleteSupplier);

// Purchases
router.get('/', purchaseController.getPurchases);
router.get('/:id', purchaseController.getPurchaseById);
router.post('/', authorize('ADMIN', 'MANAGER'), purchaseController.createPurchase);
router.put('/:id/payment', authorize('ADMIN', 'MANAGER'), purchaseController.recordSupplierPayment);

module.exports = router;
