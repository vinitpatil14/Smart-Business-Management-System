const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getSummary(req, res, next) {
    try {
      const summary = await dashboardService.getSummary(req.user);
      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  async getCharts(req, res, next) {
    try {
      const charts = await dashboardService.getChartsData(req.user);
      res.status(200).json({ success: true, data: charts });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
