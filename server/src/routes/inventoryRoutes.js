const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Products
router.get('/products', inventoryController.getProducts);
router.get('/products/:id', inventoryController.getProductById);
router.post('/products', authorize('ADMIN', 'MANAGER'), inventoryController.createProduct);
router.put('/products/:id', authorize('ADMIN', 'MANAGER'), inventoryController.updateProduct);
router.post('/products/:id/restore', authorize('ADMIN', 'MANAGER'), inventoryController.restoreProduct);
router.delete('/products/:id', authorize('ADMIN'), inventoryController.deleteProduct);

// Low-stock alerts
router.get('/low-stock', inventoryController.getLowStockAlerts);

// Categories
router.get('/categories', inventoryController.getCategories);
router.post('/categories', authorize('ADMIN', 'MANAGER'), inventoryController.createCategory);
router.put('/categories/:id', authorize('ADMIN', 'MANAGER'), inventoryController.updateCategory);
router.delete('/categories/:id', authorize('ADMIN'), inventoryController.deleteCategory);

module.exports = router;
