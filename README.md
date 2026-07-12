# TransitOps ERP

Ye project ek transport/vehicle management system hai jisme vehicles, drivers, trips, maintenance, fuel logs, expenses aur admin management ke liye complete workflow provide kiya gaya hai.

## Project Overview

Is system ka main objective hai:
- Fleet/vehicle ko track karna
- Drivers aur trips manage karna
- Maintenance, fuel aur expenses record karna
- Admin ko users aur roles manage karne ka access dena
- Role-based access ke through secure dashboard experience provide karna

## Main Features

### User / Operator Features
- User registration aur login
- Dashboard overview
- Vehicles management
- Drivers management
- Trips management
- Maintenance logs
- Fuel logs
- Expenses tracking
- Reports aur settings

### Admin Features
- Admin login panel
- User management
- Role management
- Permission-based access control

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Swagger API Docs
- Zod validation

### Frontend
- React + Vite
- React Router DOM
- Formik
- Axios
- Recharts
- Tailwind-style UI components

## Project Structure

- backend/ - Express API server, routes, controllers, models, middleware
- frontend/ - React app UI
- backend/scripts/ - Admin seeding scripts
- backend/config/ - DB and Swagger config

## Workflow

1. Backend server start hota hai aur MongoDB connect hota hai.
2. User / Admin login karta hai.
3. User ko dashboard me modules dikhte hain jahan wo:
   - Vehicles add/edit/manage karta hai
   - Drivers manage karta hai
   - Trips create aur track karta hai
   - Maintenance logs record karta hai
   - Fuel logs aur expenses add karta hai
   - Reports dekh sakta hai
4. Admin super admin role ke through /admin panel me jaa ke:
   - users manage karta hai
   - roles aur permissions configure karta hai

## How to Run the Project

### Prerequisites
- Node.js installed
- MongoDB running locally or reachable via URI

### 1. Backend Setup
```bash
cd backend
npm install
```

Create a .env file inside backend/ with:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/transitops
```

Start backend:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

Start frontend:
```bash
npm run dev
```

### 3. Seed Admin User
Admin account create karne ke liye run karo:
```bash
cd backend
node scripts/seedAdmin.js
```

Ye script:
- Super Admin role create karta hai
- Admin user create karta hai
- Password reset karta hai

## Admin Dashboard Access

Admin dashboard khulne ka route hai:
- Open: http://localhost:5173/admin/login

After login, admin redirect ho jaata hai:
- Admin Dashboard: http://localhost:5173/admin

### Default Admin Credentials
```text
Email: admin@transitops.com
Password: admin123
```

> Important: Pehle login ke baad password change kar dena chahiye.

## Regular User Access

Normal user login ke liye:
- Open: http://localhost:5173/login

New account banane ke liye:
- Open: http://localhost:5173/register

## API Documentation

Swagger docs available hai at:
- http://localhost:5000/docs

## Default Routes

### Frontend Routes
- /login
- /register
- /dashboard
- /dashboard/vehicles
- /dashboard/drivers
- /dashboard/trips
- /dashboard/maintenance
- /dashboard/fuel-logs
- /dashboard/expenses
- /dashboard/reports
- /dashboard/settings
- /admin/login
- /admin
- /admin/users
- /admin/roles

### Backend API Base
- /api/auth
- /api/roles
- /api/users
- /api/vehicles
- /api/drivers
- /api/trips
- /api/maintenance
- /api/fuel-logs
- /api/expenses

## Notes for Judges / Reviewers

- Project ka main entry point frontend hai.
- Admin access ke liye /admin/login use karo.
- Default admin credentials mention above hain.
- Backend API docs ko /docs par dekh sakte ho.
- Agar MongoDB connection fail ho raha ho to ensure karo ki local MongoDB running ho.

## Quick Start Summary

```bash
# Terminal 1
cd backend
npm install
npm run dev

# Terminal 2
cd frontend
npm install
npm run dev
```

Then:
- Visit http://localhost:5173/login for user login
- Visit http://localhost:5173/admin/login for admin login
- Seed admin with: cd backend && node scripts/seedAdmin.js
