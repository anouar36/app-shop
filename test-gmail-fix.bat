@echo off
echo ========================================
echo Testing Email After Gmail Fix
echo ========================================
echo.
echo This will test if Gmail App Password is working
echo.

cd c:\xampp\htdocs\shop\shop-backend

echo Checking current email configuration...
php -r "
require 'vendor/autoload.php';
\$app = require 'bootstrap/app.php';
\$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo 'Current MAIL settings:' . PHP_EOL;
echo 'MAIL_HOST: ' . config('mail.mailers.smtp.host') . PHP_EOL;
echo 'MAIL_USERNAME: ' . config('mail.mailers.smtp.username') . PHP_EOL;
echo 'MAIL_PASSWORD: ' . (config('mail.mailers.smtp.password') === 'your_gmail_app_password_here' ? 'PLACEHOLDER (NEEDS REAL PASSWORD)' : 'SET (length: ' . strlen(config('mail.mailers.smtp.password')) . ' chars)') . PHP_EOL;
echo 'MAIL_FROM: ' . config('mail.from.address') . PHP_EOL;
echo PHP_EOL;

if (config('mail.mailers.smtp.password') === 'your_gmail_app_password_here') {
    echo '❌ PROBLEM: Still using placeholder password!' . PHP_EOL;
    echo '🔧 FIX: Set real Gmail App Password in .env file' . PHP_EOL;
} else {
    echo '✅ Gmail App Password is set!' . PHP_EOL;
    echo '🧪 Ready to test email sending...' . PHP_EOL;
}
"

echo.
echo ========================================
echo To test email after fixing:
echo 1. Set real Gmail App Password in .env
echo 2. Restart Laravel server
echo 3. Send order via Postman
echo 4. Check Gmail inbox for notification
echo ========================================
pause
