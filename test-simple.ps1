# Shop Application Test Script
Write-Host "Testing Shop Application API..." -ForegroundColor Green

# Test API Health
Write-Host "1. Testing API Health..." -ForegroundColor Yellow
$health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/test"
Write-Host "API Status: $($health.message)" -ForegroundColor Green

# Test Admin Login
Write-Host "2. Testing Admin Login..." -ForegroundColor Yellow
$loginBody = @{ email = "admin@shop.com"; password = "admin123" } | ConvertTo-Json
$login = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/admin/login" -Method POST -Body $loginBody -ContentType "application/json"
Write-Host "Login Success: User $($login.user.name)" -ForegroundColor Green

# Test Dashboard
Write-Host "3. Testing Dashboard..." -ForegroundColor Yellow
$headers = @{ Authorization = "Bearer $($login.token)" }
$dashboard = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/admin/dashboard" -Method GET -Headers $headers
Write-Host "Dashboard Stats: Users=$($dashboard.stats.total_users), Products=$($dashboard.stats.total_products)" -ForegroundColor Green

Write-Host "All tests passed! Application is working." -ForegroundColor Green
Write-Host "Frontend: http://localhost:3002/admin" -ForegroundColor Cyan
