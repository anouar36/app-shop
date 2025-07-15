@echo off
echo ====================================
echo Gmail App Password Setup Guide
echo ====================================
echo.
echo Problem: Email authentication failed
echo Solution: Create Gmail App Password
echo.
echo Steps to follow:
echo 1. Go to: https://myaccount.google.com/security
echo 2. Enable 2-Step Verification (if not enabled)
echo 3. Go to App Passwords section
echo 4. Create password for "Mail"
echo 5. Copy the 16-character password
echo 6. Update .env file with real password
echo.
echo Current .env setting (BROKEN):
echo MAIL_PASSWORD=your_gmail_app_password_here
echo.
echo Needed .env setting (WORKING):
echo MAIL_PASSWORD=your_real_16_char_password
echo.
echo Press any key to open Google Account Security...
pause
start https://myaccount.google.com/security
