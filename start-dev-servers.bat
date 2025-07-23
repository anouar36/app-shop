@echo off
title Development Server Startup
echo.
echo 🚀 Starting Development Servers...
echo.

echo 📊 Starting Laravel Backend Server...
start "Laravel Backend" powershell.exe -Command "cd 'c:\xampp\htdocs\shop\shop-backend'; php artisan serve --host=127.0.0.1 --port=8001; Read-Host 'Press Enter to close'"

timeout /t 3 > nul

echo 🌐 Starting Next.js Frontend Server...
start "Next.js Frontend" powershell.exe -Command "cd 'c:\xampp\htdocs\shop\shop-app'; npm run dev; Read-Host 'Press Enter to close'"

echo.
echo ✅ Both servers are starting up!
echo.
echo 📊 Backend API: http://127.0.0.1:8001
echo 🌐 Frontend:    http://localhost:3003
echo 🔐 Admin Panel: http://localhost:3003/admin
echo.
echo 💡 Each server is running in its own window.
echo 💡 Close the respective window to stop each server.
echo.
pause
