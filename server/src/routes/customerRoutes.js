const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', customerController.getCustomers);
router.get('/all-list', customerController.getAllCustomersList);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.delete('/:id', authorize('ADMIN', 'MANAGER'), customerController.deleteCustomer);

module.exports = router;
