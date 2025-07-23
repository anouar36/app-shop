# Development Server Startup Script
# This script starts both the Laravel backend and Next.js frontend servers

Write-Host "🚀 Starting Development Servers..." -ForegroundColor Green

# Function to start a server in a new PowerShell window
function Start-ServerInNewWindow {
    param(
        [string]$Title,
        [string]$Command,
        [string]$WorkingDirectory
    )
    
    Write-Host "Starting $Title..." -ForegroundColor Yellow
    
    # Create the full command to run in the new window
    $fullCommand = "cd '$WorkingDirectory'; $Command; Read-Host 'Press Enter to close'"
    
    # Start the server in a new PowerShell window
    Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $fullCommand -WindowStyle Normal
    
    Write-Host "$Title started in new window" -ForegroundColor Green
}

# Start Laravel Backend Server
$backendPath = "c:\xampp\htdocs\shop\shop-backend"
$backendCommand = "php artisan serve --host=127.0.0.1 --port=8001"
Start-ServerInNewWindow -Title "Laravel Backend" -Command $backendCommand -WorkingDirectory $backendPath

# Wait a moment for the backend to start
Start-Sleep -Seconds 3

# Start Next.js Frontend Server
$frontendPath = "c:\xampp\htdocs\shop\shop-app"
$frontendCommand = "npm run dev"
Start-ServerInNewWindow -Title "Next.js Frontend" -Command $frontendCommand -WorkingDirectory $frontendPath

Write-Host ""
Write-Host "✅ Both servers are starting up!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Backend API: http://127.0.0.1:8001" -ForegroundColor Cyan
Write-Host "🌐 Frontend:    http://localhost:3003" -ForegroundColor Cyan
Write-Host "🔐 Admin Panel: http://localhost:3003/admin" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Each server is running in its own window." -ForegroundColor Yellow
Write-Host "💡 Close the respective window to stop each server." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
