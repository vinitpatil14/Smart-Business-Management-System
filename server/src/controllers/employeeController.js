const employeeService = require('../services/employeeService');

class EmployeeController {
  // Employees
  async getEmployees(req, res, next) {
    try {
      const employees = await employeeService.getEmployees(req.query);
      res.status(200).json({ success: true, data: employees });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeById(req, res, next) {
    try {
      const employee = await employeeService.getEmployeeById(req.params.id);
      res.status(200).json({ success: true, data: employee });
    } catch (error) {
      next(error);
    }
  }

  async createEmployee(req, res, next) {
    try {
      const { name, phone, designation } = req.body;
      if (!name || !phone || !designation) {
        return res.status(400).json({ success: false, message: 'Name, phone, and designation are required' });
      }
      const employee = await employeeService.createEmployee(req.body);
      res.status(201).json({ success: true, message: 'Employee added successfully', data: employee });
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req, res, next) {
    try {
      const employee = await employeeService.updateEmployee(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Employee updated successfully', data: employee });
    } catch (error) {
      next(error);
    }
  }

  async deleteEmployee(req, res, next) {
    try {
      await employeeService.deleteEmployee(req.params.id);
      res.status(200).json({ success: true, message: 'Employee deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // Attendance
  async markAttendance(req, res, next) {
    try {
      const { employeeId, date, status, notes } = req.body;
      if (!employeeId) {
        return res.status(400).json({ success: false, message: 'Employee ID is required' });
      }
      const record = await employeeService.markAttendance({ employeeId, date, status, notes });
      res.status(200).json({ success: true, message: 'Attendance recorded', data: record });
    } catch (error) {
      next(error);
    }
  }

  async getAttendanceForDate(req, res, next) {
    try {
      const list = await employeeService.getAttendanceForDate(req.query.date);
      res.status(200).json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  // Payroll
  async getPayrollSummary(req, res, next) {
    try {
      const { year, month } = req.query;
      const payroll = await employeeService.getPayrollSummary(year, month);
      res.status(200).json({ success: true, data: payroll });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmployeeController();
