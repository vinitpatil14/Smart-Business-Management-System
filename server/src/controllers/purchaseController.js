const purchaseService = require('../services/purchaseService');

class PurchaseController {
  // Suppliers
  async getSuppliers(req, res, next) {
    try {
      const suppliers = await purchaseService.getSuppliers(req.query);
      res.status(200).json({ success: true, data: suppliers });
    } catch (error) {
      next(error);
    }
  }

  async getSupplierById(req, res, next) {
    try {
      const supplier = await purchaseService.getSupplierById(req.params.id);
      res.status(200).json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  }

  async createSupplier(req, res, next) {
    try {
      if (!req.body.name) {
        return res.status(400).json({ success: false, message: 'Supplier name is required' });
      }
      const supplier = await purchaseService.createSupplier(req.body);
      res.status(201).json({ success: true, message: 'Supplier created successfully', data: supplier });
    } catch (error) {
      next(error);
    }
  }

  async updateSupplier(req, res, next) {
    try {
      const supplier = await purchaseService.updateSupplier(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Supplier updated successfully', data: supplier });
    } catch (error) {
      next(error);
    }
  }

  async deleteSupplier(req, res, next) {
    try {
      await purchaseService.deleteSupplier(req.params.id);
      res.status(200).json({ success: true, message: 'Supplier deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Purchases
  async createPurchase(req, res, next) {
    try {
      const purchase = await purchaseService.createPurchase(req.body);
      res.status(201).json({ success: true, message: 'Purchase recorded and stock increased', data: purchase });
    } catch (error) {
      next(error);
    }
  }

  async getPurchases(req, res, next) {
    try {
      const result = await purchaseService.getPurchases(req.query);
      res.status(200).json({ success: true, data: result.purchases, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getPurchaseById(req, res, next) {
    try {
      const purchase = await purchaseService.getPurchaseById(req.params.id);
      res.status(200).json({ success: true, data: purchase });
    } catch (error) {
      next(error);
    }
  }

  async recordSupplierPayment(req, res, next) {
    try {
      const updated = await purchaseService.recordSupplierPayment(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Supplier payment recorded successfully', data: updated });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PurchaseController();
