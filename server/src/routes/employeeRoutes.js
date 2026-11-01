const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Employees
router.get('/', employeeController.getEmployees);
router.get('/attendance', employeeController.getAttendanceForDate);
router.get('/payroll', authorize('ADMIN', 'MANAGER'), employeeController.getPayrollSummary);
router.get('/:id', employeeController.getEmployeeById);

router.post('/', authorize('ADMIN', 'MANAGER'), employeeController.createEmployee);
router.put('/:id', authorize('ADMIN', 'MANAGER'), employeeController.updateEmployee);
router.delete('/:id', authorize('ADMIN'), employeeController.deleteEmployee);

// Attendance marking
router.post('/attendance', authorize('ADMIN', 'MANAGER', 'STAFF'), employeeController.markAttendance);

module.exports = router;
