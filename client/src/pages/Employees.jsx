import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Calendar,
  DollarSign,
  Check,
  X,
  Clock,
  Briefcase,
  Edit,
  Trash2,
  Users
} from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';

const Employees = () => {
  const [activeTab, setActiveTab] = useState('employees'); // 'employees', 'attendance', 'payroll'
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Attendance state
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dailyAttendance, setDailyAttendance] = useState([]);
  const [markingId, setMarkingId] = useState(null);

  // Payroll state
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
  const [payrollData, setPayrollData] = useState(null);

  // Employee Modal
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    phone: '',
    designation: '',
    department: 'Sales',
    baseSalary: '',
    status: 'ACTIVE'
  });

  const { user } = useAuth();
  const canManage = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees');
      if (res.data.success) setEmployees(res.data.data);
    } catch (err) {
      console.error('Failed to load employees', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceForDate = async (date) => {
    try {
      const res = await api.get('/employees/attendance', { params: { date } });
      if (res.data.success) setDailyAttendance(res.data.data);
    } catch (err) {
      console.error('Failed to load daily attendance', err);
    }
  };

  const loadPayroll = async (year, month) => {
    try {
      const res = await api.get('/employees/payroll', { params: { year, month } });
      if (res.data.success) setPayrollData(res.data.data);
    } catch (err) {
      console.error('Failed to load payroll', err);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (activeTab === 'attendance') {
      loadAttendanceForDate(attendanceDate);
    } else if (activeTab === 'payroll') {
      loadPayroll(payrollYear, payrollMonth);
    }
  }, [activeTab, attendanceDate, payrollYear, payrollMonth]);

  // Employee modal handlers
  const openAddEmployee = () => {
    setEditingEmployee(null);
    setEmployeeForm({
      name: '',
      email: '',
      phone: '',
      designation: '',
      department: 'Sales',
      baseSalary: '',
      status: 'ACTIVE'
    });
    setIsEmployeeModalOpen(true);
  };

  const openEditEmployee = (emp) => {
    setEditingEmployee(emp);
    setEmployeeForm({
      name: emp.name,
      email: emp.email || '',
      phone: emp.phone,
      designation: emp.designation,
      department: emp.department,
      baseSalary: emp.baseSalary,
      status: emp.status
    });
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.id}`, employeeForm);
      } else {
        await api.post('/employees', employeeForm);
      }
      setIsEmployeeModalOpen(false);
      loadEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save employee');
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    if (!window.confirm(`Delete employee '${name}'?`)) return;
    try {
      await api.delete(`/employees/${id}`);
      loadEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  // Mark attendance for a single employee
  const handleMarkAttendance = async (employeeId, status) => {
    setMarkingId(employeeId);
    try {
      await api.post('/employees/attendance', {
        employeeId,
        date: attendanceDate,
        status,
        notes: `Marked ${status}`
      });
      loadAttendanceForDate(attendanceDate);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update attendance');
    } finally {
      setMarkingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Staff, Attendance & Payroll</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage employees, record daily attendance, and calculate monthly salary payouts
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'employees'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Employees
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeTab === 'attendance'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Attendance
            </button>
            {canManage && (
              <button
                onClick={() => setActiveTab('payroll')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  activeTab === 'payroll'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Payroll Calculator
              </button>
            )}
          </div>

          {canManage && activeTab === 'employees' && (
            <button
              onClick={openAddEmployee}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add Employee</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'employees' && (
        /* Employees Table */
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-900/40 text-gray-500 dark:text-gray-400 uppercase font-semibold">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Designation & Dept</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4 text-right">Base Salary</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  {canManage && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-900 dark:text-white block">
                        {emp.name}
                      </span>
                      {emp.email && <span className="text-[11px] text-gray-400">{emp.email}</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-gray-900 dark:text-white font-medium block">
                        {emp.designation}
                      </span>
                      <span className="text-[11px] text-gray-400">{emp.department}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-300 font-mono">
                      {emp.phone}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 dark:text-white">
                      ₹{emp.baseSalary?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEditEmployee(emp)}
                            className="p-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          {user?.role === 'ADMIN' && (
                            <button
                              onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                              className="p-1 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        /* Daily Attendance View */
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Select Date:</span>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs text-gray-900 dark:text-white"
              />
            </div>

            <span className="text-xs text-gray-400">
              Showing {dailyAttendance.length} active employees
            </span>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[550px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-900/40 text-gray-500 dark:text-gray-400 uppercase font-semibold">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4 text-center">Current Status</th>
                    <th className="py-3 px-4 text-right">Mark Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                  {dailyAttendance.map((row) => (
                    <tr key={row.employeeId} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition">
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900 dark:text-white block">
                          {row.name}
                        </span>
                        <span className="text-[11px] text-gray-400">{row.department}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                        {row.designation}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            row.status === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : row.status === 'HALF_DAY'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : row.status === 'LEAVE'
                              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                              : row.status === 'ABSENT'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            disabled={markingId === row.employeeId}
                            onClick={() => handleMarkAttendance(row.employeeId, 'PRESENT')}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition ${
                              row.status === 'PRESENT'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'border-emerald-200 dark:border-emerald-900 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            disabled={markingId === row.employeeId}
                            onClick={() => handleMarkAttendance(row.employeeId, 'HALF_DAY')}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition ${
                              row.status === 'HALF_DAY'
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'border-amber-200 dark:border-amber-900 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                            }`}
                          >
                            Half Day
                          </button>
                          <button
                            disabled={markingId === row.employeeId}
                            onClick={() => handleMarkAttendance(row.employeeId, 'LEAVE')}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition ${
                              row.status === 'LEAVE'
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'border-indigo-200 dark:border-indigo-900 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                            }`}
                          >
                            Leave
                          </button>
                          <button
                            disabled={markingId === row.employeeId}
                            onClick={() => handleMarkAttendance(row.employeeId, 'ABSENT')}
                            className={`px-2 py-1 rounded-lg text-[11px] font-semibold border transition ${
                              row.status === 'ABSENT'
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        /* Payroll Calculator View */
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Period:</span>
              <select
                value={payrollMonth}
                onChange={(e) => setPayrollMonth(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs"
              >
                {[...Array(12).keys()].map((i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2026, i, 1).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={payrollYear}
                onChange={(e) => setPayrollYear(e.target.value)}
                className="w-20 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs font-mono"
              />
            </div>

            <div className="text-right">
              <span className="text-xs text-gray-400 mr-2">Monthly Total Payroll Outflow:</span>
              <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                ₹{(payrollData?.totalPayrollExpense || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[550px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50/70 dark:bg-slate-900/40 text-gray-500 dark:text-gray-400 uppercase font-semibold">
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4 text-right">Base Salary</th>
                    <th className="py-3 px-4 text-center">Present</th>
                    <th className="py-3 px-4 text-center">Half Day</th>
                    <th className="py-3 px-4 text-center">Leave</th>
                    <th className="py-3 px-4 text-center">Payable Days</th>
                    <th className="py-3 px-4 text-right">Net Payable Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/60">
                  {payrollData?.payroll?.map((p) => (
                    <tr key={p.employeeId} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition">
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        {p.name}
                        <span className="block text-[11px] text-gray-400 font-normal">{p.designation}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-gray-500">
                        ₹{p.baseSalary?.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-600">
                        {p.presentDays}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-amber-600">
                        {p.halfDays}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-indigo-600">
                        {p.leaveDays}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        {p.payableDays} / {p.totalMonthDays}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                        ₹{p.netSalary?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Employee Modal */}
      <Modal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        title={editingEmployee ? 'Edit Employee Record' : 'Add New Employee'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveEmployee} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={employeeForm.name}
              onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
              <input
                type="text"
                required
                value={employeeForm.phone}
                onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={employeeForm.email}
                onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Designation *</label>
              <input
                type="text"
                required
                value={employeeForm.designation}
                onChange={(e) => setEmployeeForm({ ...employeeForm, designation: e.target.value })}
                placeholder="e.g. Sales Executive"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Department</label>
              <select
                value={employeeForm.department}
                onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="Sales">Sales & POS</option>
                <option value="Logistics">Logistics & Warehouse</option>
                <option value="Finance">Finance & Accounts</option>
                <option value="Support">Support & Services</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Base Monthly Salary (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={employeeForm.baseSalary}
                onChange={(e) => setEmployeeForm({ ...employeeForm, baseSalary: e.target.value })}
                placeholder="25000"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select
                value={employeeForm.status}
                onChange={(e) => setEmployeeForm({ ...employeeForm, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsEmployeeModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm"
            >
              Save Employee
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
