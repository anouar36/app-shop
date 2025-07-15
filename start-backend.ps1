# Start Laravel Backend Server
Write-Host "Starting Laravel Backend Server..." -ForegroundColor Green

# Navigate to backend directory
Set-Location "c:\xampp\htdocs\shop\shop-backend"

# Check if Laravel is properly set up
if (Test-Path "artisan") {
    Write-Host "Laravel artisan found. Starting server..." -ForegroundColor Yellow
    php artisan serve --host=127.0.0.1 --port=8000
} else {
    Write-Host "Error: Laravel artisan not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the correct directory." -ForegroundColor Red
}

# Keep the window open
Read-Host "Press Enter to exit"
