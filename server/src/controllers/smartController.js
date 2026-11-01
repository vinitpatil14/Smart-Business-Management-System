const smartService = require('../services/smartService');

class SmartController {
  async getLowStockPredictions(req, res, next) {
    try {
      const data = await smartService.getLowStockPredictions();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getProductInsights(req, res, next) {
    try {
      const data = await smartService.getProductInsights();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getPaymentReminders(req, res, next) {
    try {
      const data = await smartService.getPaymentReminders();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SmartController();
