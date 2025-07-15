@echo off
echo ========================================
echo Gmail App Password Setup Helper
echo ========================================
echo.
echo Current Status: PLACEHOLDER PASSWORD DETECTED
echo.
echo Step 1: Create Gmail App Password
echo ---------------------------------
echo 1. Open: https://myaccount.google.com/security
echo 2. Click "2-Step Verification" (enable if needed)
echo 3. Click "App passwords"
echo 4. Create password for "Mail"
echo 5. Copy the 16-character password
echo.
echo Step 2: Update .env File
echo -------------------------
echo Replace this line in .env:
echo MAIL_PASSWORD=your_real_gmail_app_password_here
echo.
echo With:
echo MAIL_PASSWORD=your_actual_16_char_password
echo.
echo Step 3: Test Configuration
echo ---------------------------
echo After updating, run:
echo cd shop-backend
echo php ..\check-gmail-config.php
echo.
echo Press Enter to open Google Account Security...
pause
start https://myaccount.google.com/security
echo.
echo After setting up the password, press Enter to check config...
pause
cd shop-backend
php ..\check-gmail-config.php
pause
