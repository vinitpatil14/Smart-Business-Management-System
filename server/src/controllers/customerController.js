const customerService = require('../services/customerService');

class CustomerController {
  async getCustomers(req, res, next) {
    try {
      const result = await customerService.getCustomers(req.query, req.user);
      res.status(200).json({ success: true, data: result.customers, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  async getAllCustomersList(req, res, next) {
    try {
      const customers = await customerService.getAllCustomersList(req.user);
      res.status(200).json({ success: true, data: customers });
    } catch (error) {
      next(error);
    }
  }

  async getCustomerById(req, res, next) {
    try {
      const customer = await customerService.getCustomerById(req.params.id);
      res.status(200).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  async createCustomer(req, res, next) {
    try {
      if (!req.body.name) {
        return res.status(400).json({ success: false, message: 'Customer name is required' });
      }
      const customer = await customerService.createCustomer(req.body);
      res.status(201).json({ success: true, message: 'Customer created successfully', data: customer });
    } catch (error) {
      next(error);
    }
  }

  async updateCustomer(req, res, next) {
    try {
      const customer = await customerService.updateCustomer(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Customer updated successfully', data: customer });
    } catch (error) {
      next(error);
    }
  }

  async deleteCustomer(req, res, next) {
    try {
      await customerService.deleteCustomer(req.params.id);
      res.status(200).json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerController();
