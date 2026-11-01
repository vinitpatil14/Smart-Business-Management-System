const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', expenseController.getExpenses);
router.get('/summary', expenseController.getSummary);
router.post('/', expenseController.createExpense);
router.put('/:id', authorize('ADMIN', 'MANAGER'), expenseController.updateExpense);
router.delete('/:id', authorize('ADMIN'), expenseController.deleteExpense);

module.exports = router;
