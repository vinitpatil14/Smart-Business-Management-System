const inventoryService = require('../services/inventoryService');

class InventoryController {
  // Products
  async getProducts(req, res, next) {
    try {
      const result = await inventoryService.getProducts(req.query, req.user);
      res.status(200).json({ success: true, data: result.products, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const product = await inventoryService.getProductById(req.params.id);
      res.status(200).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req, res, next) {
    try {
      const { name, categoryId, purchasePrice, sellingPrice } = req.body;
      if (!name || !categoryId || purchasePrice === undefined || sellingPrice === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Product name, categoryId, purchasePrice, and sellingPrice are required'
        });
      }
      const product = await inventoryService.createProduct(req.body);
      res.status(201).json({ success: true, message: 'Product created successfully', data: product });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const product = await inventoryService.updateProduct(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Product updated successfully', data: product });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const result = await inventoryService.deleteProduct(req.params.id, req.query.force);
      res.status(200).json({
        success: true,
        message: result.message || 'Product deleted successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async restoreProduct(req, res, next) {
    try {
      const result = await inventoryService.restoreProduct(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Product restored to active catalog successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async getLowStockAlerts(req, res, next) {
    try {
      const lowStock = await inventoryService.getLowStockAlerts();
      res.status(200).json({ success: true, count: lowStock.length, data: lowStock });
    } catch (error) {
      next(error);
    }
  }

  // Categories
  async getCategories(req, res, next) {
    try {
      const categories = await inventoryService.getCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req, res, next) {
    try {
      if (!req.body.name) {
        return res.status(400).json({ success: false, message: 'Category name is required' });
      }
      const category = await inventoryService.createCategory(req.body);
      res.status(201).json({ success: true, message: 'Category created successfully', data: category });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req, res, next) {
    try {
      const category = await inventoryService.updateCategory(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Category updated successfully', data: category });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      await inventoryService.deleteCategory(req.params.id);
      res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new InventoryController();
