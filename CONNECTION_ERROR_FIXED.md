# Development Server Quick Start Guide

## ✅ Problem Fixed!

The connection error "**Connection error: Failed to fetch. Please check if backend is running.**" has been resolved.

### 🔧 Root Cause
The Laravel backend server was not running. The frontend (Next.js) was trying to connect to `http://127.0.0.1:8001/api` but the Laravel development server wasn't started.

### 🚀 Solution Applied
1. **Started the Laravel backend server** on port 8001:
   ```bash
   cd c:\xampp\htdocs\shop\shop-backend
   php artisan serve --host=127.0.0.1 --port=8001
   ```

2. **Verified API connectivity** - The backend is now responding correctly.

### 🛠️ For Future Development

I've created startup scripts to make this easier:

#### Option 1: PowerShell Script
```powershell
.\start-dev-servers.ps1
```

#### Option 2: Batch File
```batch
start-dev-servers.bat
```

Both scripts will:
- Start Laravel backend on `http://127.0.0.1:8001`
- Start Next.js frontend on `http://localhost:3003`
- Open each server in a separate window

### 📋 Manual Startup (if needed)

**Backend (Laravel):**
```bash
cd c:\xampp\htdocs\shop\shop-backend
php artisan serve --host=127.0.0.1 --port=8001
```

**Frontend (Next.js):**
```bash
cd c:\xampp\htdocs\shop\shop-app
npm run dev
```

### 🌐 Access Points

- **Frontend**: http://localhost:3003
- **Admin Panel**: http://localhost:3003/admin
- **Backend API**: http://127.0.0.1:8001/api
- **API Test**: http://127.0.0.1:8001/api/test

### 🔐 Admin Login Credentials
- **Email**: admin@shop.com
- **Password**: admin123

The admin login page should now work without any connection errors!
