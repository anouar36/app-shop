@echo off
echo ========================================
echo   Gmail App Password Setup Helper
echo ========================================
echo.
echo Step 1: Generate Gmail App Password
echo -----------------------------------
echo 1. Go to: https://myaccount.google.com/security
echo 2. Enable 2-Step Verification (if not enabled)
echo 3. Go to "App passwords" section
echo 4. Create app password for "Mail" / "Windows Computer"
echo 5. Copy the 16-character password (remove spaces)
echo.
echo Step 2: Update .env File
echo -------------------------
echo File location: c:\xampp\htdocs\shop\shop-backend\.env
echo Find line: MAIL_PASSWORD=your_real_gmail_app_password_here
echo Replace with: MAIL_PASSWORD=YOUR_16_CHAR_PASSWORD
echo.
echo Step 3: Restart Laravel Server
echo -------------------------------
echo Run: cd c:\xampp\htdocs\shop\shop-backend
echo Run: php artisan serve --host=127.0.0.1 --port=8000
echo.
pause
echo.
echo Opening required locations...
echo.

REM Open the .env file directory
explorer "c:\xampp\htdocs\shop\shop-backend"

REM Open Gmail security page
start https://myaccount.google.com/security

REM Open the fix guide
start "" "c:\xampp\htdocs\shop\fix-email-notifications.html"

echo.
echo All necessary windows opened!
echo Follow the steps above to complete the setup.
echo.
pause
