# 🚀 Smart Business Management System (SBMS)

A modern, production-grade, full-stack web application designed for small and medium businesses (retail shops, wholesale distributors, service agencies).

Built with **React**, **Vite**, **Tailwind CSS**, **Node.js**, **Express**, **Prisma ORM**, **SQLite** (switchable to PostgreSQL), and **Recharts**.

---

## 📸 Key Modules & Features

1. **Authentication & Roles (RBAC)**:
   - JWT-based authentication with role-based permissions (`ADMIN`, `MANAGER`, `STAFF`).
   - Admin user management: create staff logins, modify permissions, toggle active status.
   - Demo one-click account selector on the login screen.

2. **Executive Dashboard**:
   - Live metrics: Today's Sales, Monthly Revenue, Net Profit (after COGS & expenses), Pending Customer Dues.
   - **Recharts Line Chart**: 14-day daily sales trend.
   - **Recharts Bar Chart**: Monthly Revenue vs Overhead Expenses.
   - **Recharts Pie Chart**: Category sales distribution.
   - Real-time low-stock alerts & top-selling fast mover rankings.

3. **Inventory Management**:
   - Full Product CRUD with SKU, Barcode/EAN, Category, Unit, Cost Price, Selling Price.
   - Real-time stock quantity tracking with customizable reorder alert threshold.
   - Catalog Category management with live item counts.
   - Search by product name, SKU, or barcode; filter by category or low-stock.

4. **Sales & Point of Sale (POS)**:
   - Interactive POS billing terminal with catalog browsing and category chips.
   - Instant cart with quantity adjusters and stock limit guards.
   - Customer loyalty lookup and quick customer registration modal.
   - GST tax calculation (0%, 5%, 12%, 18%, 28%) and custom discounts.
   - Payment modes: `CASH`, `UPI`, `CARD`, `CREDIT`.
   - **Automatic Stock Deduction** inside atomic database transactions.
   - Printable retail tax invoice preview with print/PDF export.
   - Invoices history with balance due collection modal.

5. **Purchases & Suppliers**:
   - Supplier directory with contact info, GSTIN, and balance due tracking.
   - Purchase order creation that **automatically increases warehouse product stock**.
   - Supplier payment settlement modal to reduce outstanding balance.

6. **Customer CRM & Loyalty**:
   - Customer directory with search, phone, email, address, and outstanding balance.
   - Automated loyalty points reward engine (1 point earned per ₹100 spent).
   - Customer purchase ledger modal displaying full past invoice history.

7. **Expense Tracking**:
   - Record overhead expenditures by category (`RENT`, `UTILITIES`, `SALARY`, `MAINTENANCE`, `SUPPLIES`, `MARKETING`, `OTHER`).
   - Monthly expense summaries and top overhead category analytics.

8. **Employee Management & Payroll**:
   - Employee records across Sales, Logistics, Finance, and Support.
   - Daily attendance tracker (`PRESENT`, `HALF_DAY`, `LEAVE`, `ABSENT`).
   - Automatic monthly payroll calculator based on working days and attendance.

9. **Reports & Analytics**:
   - Daily, weekly, monthly, and yearly sales reports.
   - **Profit & Loss Statement (P&L)**: Revenue − COGS − Operating Expenses = Net Profit.
   - Stock valuation report at cost price and retail price with potential gross margin.
   - Customer dues and aging receivables ledger.
   - **One-click CSV export** for all reports.

10. **Smart Predictive Features**:
    - **Stockout Predictor**: Computes daily burn-rate based on recent sales trends, estimates days of remaining inventory, risk level, and calculates recommended reorder quantities.
    - **Catalog Velocity & Dead Stock**: Identifies best-sellers, high-margin items, and highlights dormant dead stock with tied-up capital.
    - **Automated Payment Reminders**: Analyzes overdue customer credit aging and generates personalized polite reminder templates ready for WhatsApp/SMS copy.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts, Axios, React Router v6 |
| **Backend** | Node.js, Express.js, REST API, JSON Web Tokens (JWT), Bcrypt.js, Morgan |
| **Database** | SQLite (development) with Prisma ORM (seamlessly switchable to PostgreSQL) |

---

## 🚀 Quick Setup & Run Instructions

### Prerequisites
- Node.js (v18 or higher) & npm

### 1. Install Dependencies
Run the following in the project root:
```bash
# Install root, backend and frontend dependencies
npm run install:all
```
*Or manually:*
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment Variables
Copy `.env.example` in `server/`:
```bash
cd server
copy .env.example .env
```
Default configuration is already set up for local development:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=sbms_super_secret_jwt_key_2026_dev_env
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
```

### 3. Initialize & Seed Database
From the root directory:
```bash
npm run setup:db
```
*Or from `server/`:*
```bash
cd server
npx prisma generate
npx prisma db push
node prisma/seed.js
```
This generates the Prisma client, creates the SQLite database tables, and seeds realistic demo data across all modules (products, categories, sales, suppliers, purchases, expenses, employees, and users).

### 4. Start the Application
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd server
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
# Client starts on http://localhost:5173
```

Visit **http://localhost:5173** in your browser.

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Super Admin** | `admin@sbms.com` | `admin123` | Full access to all 10 modules, P&L reports, and User Management |
| **Manager** | `manager@sbms.com` | `manager123` | Products, Purchases, Stock adjustments, CRM, Attendance & Payroll |
| **Sales Staff** | `staff@sbms.com` | `staff123` | POS Billing, Invoicing, Customer lookup, Attendance marking |

*Tip: The login page includes 1-click login buttons for instant testing!*

---

## 🔄 Switching to PostgreSQL for Production

To switch from SQLite to PostgreSQL:

1. In `server/prisma/schema.prisma`, update the datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `server/.env` with your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/sbms_prod?schema=public"
   ```
3. Run migrations:
   ```bash
   cd server
   npx prisma migrate dev --name init
   node prisma/seed.js
   ```

---

## 📁 Project Structure

```text
d:\SBMS project\
├── client\                  # Frontend React + Vite + Tailwind application
│   ├── src\
│   │   ├── components\      # Layout, Sidebar, Navbar, InvoiceModal, Modal, Pagination
│   │   ├── context\         # AuthContext (JWT/RBAC), ThemeContext (Dark/Light mode)
│   │   ├── pages\           # 10 core module views & User Management
│   │   ├── services\        # Axios API client with JWT interceptor
│   │   ├── App.jsx          # Route definitions & protected routes
│   │   ├── main.jsx         # App bootstrap
│   │   └── index.css        # Tailwind directives & print styles
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── server\                  # Backend Express REST API
│   ├── prisma\
│   │   ├── schema.prisma    # Complete relational database model
│   │   └── seed.js          # Realistic data seed script
│   ├── src\
│   │   ├── config\          # Prisma client singleton
│   │   ├── controllers\     # 10 module controllers
│   │   ├── middleware\      # JWT auth, RBAC authorization, error handling
│   │   ├── routes\          # Separated API routers
│   │   ├── services\        # Business logic & database operations
│   │   ├── app.js           # Express app configuration & middlewares
│   │   └── server.js        # Server entrypoint
│   ├── .env.example
│   ├── .env
│   └── package.json
├── .env.example
├── package.json
└── README.md
```
