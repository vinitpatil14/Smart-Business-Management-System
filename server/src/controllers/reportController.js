const reportService = require('../services/reportService');

class ReportController {
  async getSalesReport(req, res, next) {
    try {
      const report = await reportService.getSalesReport(req.query);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  async getProfitLossReport(req, res, next) {
    try {
      const report = await reportService.getProfitLossReport(req.query);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  async getStockReport(req, res, next) {
    try {
      const report = await reportService.getStockReport();
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerDuesReport(req, res, next) {
    try {
      const report = await reportService.getCustomerDuesReport();
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  async exportReport(req, res, next) {
    try {
      const { type } = req.params;
      const csv = await reportService.exportToCSV(type);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=sbms-${type}-${Date.now()}.csv`);
      res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ReportController();
