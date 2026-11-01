const salesService = require('../services/salesService');

class SalesController {
  async createSale(req, res, next) {
    try {
      const { customerId, items, taxPercent, discount, paymentMode, paidAmount, notes } = req.body;
      const sale = await salesService.createSale({
        customerId,
        items,
        taxPercent,
        discount,
        paymentMode,
        paidAmount,
        notes,
        userId: req.user.id
      });
      res.status(201).json({ success: true, message: 'Sale completed & invoice created', data: sale });
    } catch (error) {
      next(error);
    }
  }

  async getSales(req, res, next) {
    try {
      const result = await salesService.getSales(req.query);
      res.status(200).json({ success: true, data: result.sales, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getSaleById(req, res, next) {
    try {
      const sale = await salesService.getSaleById(req.params.id);
      res.status(200).json({ success: true, data: sale });
    } catch (error) {
      next(error);
    }
  }

  async recordPayment(req, res, next) {
    try {
      const updatedSale = await salesService.recordPayment(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Payment recorded successfully', data: updatedSale });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SalesController();
