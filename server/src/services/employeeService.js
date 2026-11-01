const prisma = require('../config/db');
const { isDemoUser } = require('../utils/userScope');

class EmployeeService {
  async getEmployees({ search = '', department = '', status = '' }, user) {
    const isDemo = isDemoUser(user);
    const where = {};
    if (!isDemo) {
      where.id = { gt: 4 };
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { designation: { contains: search } }
      ];
    }
    if (department) where.department = department;
    if (status) where.status = status;

    return prisma.employee.findMany({
      where,
      include: {
        _count: { select: { attendances: true } }
      },
      orderBy: { name: 'asc' }
    });
  }

  async getEmployeeById(id) {
    const employee = await prisma.employee.findUnique({
      where: { id: Number(id) },
      include: {
        attendances: {
          orderBy: { date: 'desc' },
          take: 31
        }
      }
    });

    if (!employee) {
      const err = new Error('Employee not found');
      err.statusCode = 404;
      throw err;
    }

    return employee;
  }

  async createEmployee(data) {
    return prisma.employee.create({
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        designation: data.designation,
        department: data.department || 'Operations',
        baseSalary: parseFloat(data.baseSalary || 0),
        status: data.status || 'ACTIVE'
      }
    });
  }

  async updateEmployee(id, data) {
    return prisma.employee.update({
      where: { id: Number(id) },
      data: {
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        designation: data.designation,
        department: data.department,
        baseSalary: data.baseSalary !== undefined ? parseFloat(data.baseSalary) : undefined,
        status: data.status
      }
    });
  }

  async deleteEmployee(id) {
    return prisma.employee.delete({
      where: { id: Number(id) }
    });
  }

  // --- Attendance ---
  async markAttendance({ employeeId, date, status = 'PRESENT', notes }) {
    const attendanceDate = new Date(date || Date.now());
    attendanceDate.setHours(0, 0, 0, 0);

    return prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: Number(employeeId),
          date: attendanceDate
        }
      },
      update: {
        status,
        notes: notes || null
      },
      create: {
        employeeId: Number(employeeId),
        date: attendanceDate,
        status,
        notes: notes || null
      }
    });
  }

  async getAttendanceForDate(date) {
    const targetDate = new Date(date || Date.now());
    targetDate.setHours(0, 0, 0, 0);

    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const [employees, attendances] = await Promise.all([
      prisma.employee.findMany({ where: { status: 'ACTIVE' }, orderBy: { name: 'asc' } }),
      prisma.attendance.findMany({
        where: {
          date: { gte: targetDate, lt: nextDate }
        }
      })
    ]);

    const attendanceMap = new Map(attendances.map(a => [a.employeeId, a]));

    return employees.map(emp => {
      const att = attendanceMap.get(emp.id);
      return {
        employeeId: emp.id,
        name: emp.name,
        designation: emp.designation,
        department: emp.department,
        baseSalary: emp.baseSalary,
        status: att ? att.status : 'NOT_MARKED',
        notes: att?.notes || '',
        attendanceId: att?.id || null
      };
    });
  }

  // --- Salary & Payroll calculation ---
  async getPayrollSummary(year, month) {
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) - 1 : new Date().getMonth();

    const startOfMonth = new Date(currentYear, currentMonth, 1, 0, 0, 0);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const employees = await prisma.employee.findMany({
      where: { status: 'ACTIVE' },
      include: {
        attendances: {
          where: {
            date: { gte: startOfMonth, lte: endOfMonth }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const payrollList = employees.map(emp => {
      let presentDays = 0;
      let halfDays = 0;
      let leaveDays = 0;
      let absentDays = 0;

      for (const a of emp.attendances) {
        if (a.status === 'PRESENT') presentDays++;
        else if (a.status === 'HALF_DAY') halfDays++;
        else if (a.status === 'LEAVE') leaveDays++;
        else if (a.status === 'ABSENT') absentDays++;
      }

      // Calculation policy: Full pay for Present + Leave (paid leave policy), 0.5 for Half Day
      const payableDays = presentDays + leaveDays + (halfDays * 0.5);
      const perDaySalary = emp.baseSalary / totalDaysInMonth;
      const calculatedSalary = Math.round(perDaySalary * payableDays * 100) / 100;

      return {
        employeeId: emp.id,
        name: emp.name,
        designation: emp.designation,
        department: emp.department,
        baseSalary: emp.baseSalary,
        totalMonthDays: totalDaysInMonth,
        presentDays,
        halfDays,
        leaveDays,
        absentDays,
        payableDays,
        netSalary: calculatedSalary
      };
    });

    const totalPayrollExpense = payrollList.reduce((acc, p) => acc + p.netSalary, 0);

    return {
      year: currentYear,
      month: currentMonth + 1,
      totalEmployees: employees.length,
      totalPayrollExpense: Math.round(totalPayrollExpense * 100) / 100,
      payroll: payrollList
    };
  }
}

module.exports = new EmployeeService();
