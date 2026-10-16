# CoreStock™ — Enterprise Inventory & Order Management System (MERN)

A production-grade, full-stack **MERN (MongoDB, Express.js, React, Node.js)** web application engineered for small-to-medium businesses to manage products, monitor real-time stock levels, execute customer sales orders with ACID-compliant stock deductions, and view interactive business statistics.

---

## 🌟 Key Features

### 1. 🔐 Authentication & Role-Based Access Control (RBAC)
- **JWT-Based Authentication**: Secure Bearer tokens with 7-day expiration and bcrypt password hashing.
- **Roles**:
  - `Admin`: Full access to create, update, delete products, adjust inventory, manage orders, and view financial statistics.
  - `Manager`: Manage products, view analytics, and perform inventory adjustments.
  - `Staff`: Warehouse staff access to adjust stock and process orders.
- **1-Click Demo Accounts**: Pre-configured demo logins directly in the UI for instant testing.

### 2. 📦 Product Management
- **Full CRUD operations**: Product Name, SKU (unique, uppercase), Category, Price, Cost Price, Stock Quantity, Minimum Stock Threshold, Unit of Measure, Barcode, and Image.
- **Automatic Status Computing**: `in_stock`, `low_stock` (when `stockQuantity <= minStockThreshold`), and `out_of_stock` (when `stockQuantity <= 0`).
- **Live Margin Telemetry**: Real-time gross margin % and profit calculations per unit.
- **Search & Filters**: Instant full-text search across Name, SKU, Category, Barcode; filter by category and stock health; sort by price and stock.
- **View Toggle**: Switch between **Dense Table View** and **Modern Product Card Grid View**.

### 3. 📊 Inventory & Stock Operations
- **Real-Time Stock Monitor**: Tracks total units on hand, total inventory cost value, total retail valuation, and potential markup profit.
- **Low Stock / Depletion Alerts**: Dedicated replenishment banner and alert table highlighting safety stock deficits.
- **Stock Adjustment Modal**:
  - **Restock**: Inward inventory from suppliers (+).
  - **Damage**: Warehouse shrinkage or damaged goods (-).
  - **Manual Audit Count**: Add or deduct physical inventory count corrections (+/-).
- **Immutable Stock Movement Audit Trail**: Every transaction (intake, sale, cancellation, damage) is permanently logged in the `StockMovement` collection with previous and updated stock balances.

### 4. 🛒 Customer Orders & Airtight Business Logic
- **Interactive Multi-Item Order Builder**:
  - Customer info: Name, Email, Phone, Shipping Address.
  - Live inventory validation: Prevents orders exceeding available stock.
  - Automatic subtotal, tax calculation (8%), discount, and total amount.
- **Strict Stock Allocation**:
  - Upon order creation, items are immediately deducted from the warehouse inventory and recorded in `StockMovement`.
- **Automatic Restitution on Cancellation**:
  - When an order is moved to `Cancelled` status, all line items are automatically credited back to inventory stock and an `ORDER_CANCELLED` audit entry is recorded!
- **Order Status Workflow**: `Pending` ➔ `Processing` ➔ `Shipped` ➔ `Delivered` ➔ `Cancelled`.
- **Tax Invoice Modal with 1-Click Print**: Clean, printable tax invoice formatted with company branding and itemized breakdown.

### 5. 📈 Executive Analytics & Dashboard
- **Executive KPI Cards**: Total Revenue, Inventory Valuation, Stock On Hand, Stock Health Index.
- **Interactive Sales Revenue Curve**: Responsive SVG bezier velocity chart mapping daily sales volume over the last 7 days with hover tooltips.
- **Department Breakdown**: Visual distribution of stock value grouped by category.
- **Top 5 Best-Selling SKUs**: Ranked leader-board by quantity sold and revenue generated.

---

## 🛠️ Technology Stack & Architecture

- **Backend**:
  - **Node.js** & **Express.js** (ES Modules)
  - **MongoDB** & **Mongoose** (Strict schema validation, text indexing, aggregation pipelines)
  - **Zero-Friction Fallback**: Connects to `MONGO_URI` (MongoDB Atlas / local) or automatically initializes an in-memory MongoDB server with auto-seeding if no external database is detected!
  - **JWT & bcryptjs** for authentication and password hashing.
  - **Morgan** for HTTP request logging and centralized error handling middleware.
- **Frontend**:
  - **React 19** with **Vite**
  - **Lucide React** for modern iconography.
  - **Custom Vanilla CSS Design System**: Dark-mode glassmorphic theme with HSL tailored status colors, JetBrains Mono typography for numbers, and responsive layouts.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+) and npm installed.

### 1. Start Backend API Server
```bash
cd backend
npm install
node server.js
```
The API server will launch on `http://localhost:5000`.
- Health Check: `http://localhost:5000/api/health`
- The database is automatically seeded with 3 demo accounts, 10 products, sample orders, and stock movements!

### 2. Start Frontend Development Server
In another terminal:
```bash
cd my-react-app
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@inventory.com` | `admin123` |
| **Manager** | `manager@inventory.com` | `manager123` |
| **Staff** | `staff@inventory.com` | `staff123` |

*(You can also use the 1-Click Quick Demo buttons on the login modal to log in instantly!)*

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login & receive JWT Bearer token
- `GET /api/auth/me` — Verify token & fetch current user profile

### Products
- `GET /api/products` — List products (query: `search`, `category`, `status`, `minPrice`, `maxPrice`, `sort`, `page`)
- `GET /api/products/categories` — Get distinct categories and counts
- `GET /api/products/:id` — Get single product details + stock movements
- `POST /api/products` — Create new product (`admin`, `manager`)
- `PUT /api/products/:id` — Update existing product (`admin`, `manager`)
- `DELETE /api/products/:id` — Delete product (`admin`)

### Inventory & Stocks
- `GET /api/inventory/overview` — Get stock unit counts, cost valuation, retail valuation, margin %
- `GET /api/inventory/alerts` — Get low stock and out-of-stock items
- `GET /api/inventory/movements` — Get audit trail of all historical stock changes
- `POST /api/inventory/adjust` — Perform Restock, Damage, or Manual Audit adjustment

### Customer Orders
- `GET /api/orders` — List orders (query: `search`, `orderStatus`, `paymentStatus`)
- `GET /api/orders/:id` — Get single order
- `POST /api/orders` — Create customer order (validates stock, atomic deduction, generates ORD-#)
- `PUT /api/orders/:id/status` — Update order status (automatically restores stock if Cancelled)

### Business Analytics
- `GET /api/stats/dashboard` — Aggregated revenue, 7-day sales trends, top sellers, category distribution
