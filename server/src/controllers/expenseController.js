const expenseService = require('../services/expenseService');

class ExpenseController {
  async getExpenses(req, res, next) {
    try {
      const result = await expenseService.getExpenses(req.query, req.user);
      res.status(200).json({ success: true, data: result.expenses, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req, res, next) {
    try {
      const summary = await expenseService.getSummary(req.user);
      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  async createExpense(req, res, next) {
    try {
      const { title, amount } = req.body;
      if (!title || amount === undefined) {
        return res.status(400).json({ success: false, message: 'Expense title and amount are required' });
      }
      const expense = await expenseService.createExpense(req.body, req.user.id);
      res.status(201).json({ success: true, message: 'Expense recorded successfully', data: expense });
    } catch (error) {
      next(error);
    }
  }

  async updateExpense(req, res, next) {
    try {
      const expense = await expenseService.updateExpense(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Expense updated successfully', data: expense });
    } catch (error) {
      next(error);
    }
  }

  async deleteExpense(req, res, next) {
    try {
      await expenseService.deleteExpense(req.params.id);
      res.status(200).json({ success: true, message: 'Expense deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExpenseController();
