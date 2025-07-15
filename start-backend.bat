@echo off
echo Starting Laravel Backend Server...
cd /d "c:\xampp\htdocs\shop\shop-backend"
if exist artisan (
    echo Laravel artisan found. Starting server...
    php artisan serve --host=127.0.0.1 --port=8000
) else (
    echo Error: Laravel artisan not found!
    echo Make sure you're in the correct directory.
)
pause
