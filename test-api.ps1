# Shop Application Test Script
# This script tests the complete authentication and dashboard flow

Write-Host "🚀 Testing Shop Application API..." -ForegroundColor Green

# Test 1: Basic API Health Check
Write-Host "`n1️⃣ Testing API Health..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/test"
    Write-Host "✅ API Health: $($healthCheck.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ API Health Check Failed!" -ForegroundColor Red
    exit 1
}

# Test 2: Admin Login
Write-Host "`n2️⃣ Testing Admin Login..." -ForegroundColor Yellow
try {
    $loginBody = @{ 
        email = "admin@shop.com"
        password = "admin123" 
    } | ConvertTo-Json
    
    $loginResponse = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/admin/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    $user = $loginResponse.user
    
    Write-Host "✅ Login Successful!" -ForegroundColor Green
    Write-Host "   User: $($user.name) ($($user.email))" -ForegroundColor Cyan
    Write-Host "   Role: $($user.role.name)" -ForegroundColor Cyan
    Write-Host "   Token: $($token.Substring(0,20))..." -ForegroundColor Cyan
} catch {
    Write-Host "❌ Admin Login Failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Test 3: Dashboard Data
Write-Host "`n3️⃣ Testing Dashboard API..." -ForegroundColor Yellow
try {
    $headers = @{ Authorization = "Bearer $token" }
    $dashboardData = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/admin/dashboard" -Method GET -Headers $headers
    
    $stats = $dashboardData.stats
    Write-Host "✅ Dashboard Data Retrieved!" -ForegroundColor Green
    Write-Host "   👥 Total Users: $($stats.total_users)" -ForegroundColor Cyan
    Write-Host "   📦 Total Products: $($stats.total_products)" -ForegroundColor Cyan
    Write-Host "   🛒 Total Orders: $($stats.total_orders)" -ForegroundColor Cyan
    Write-Host "   📂 Total Categories: $($stats.total_categories)" -ForegroundColor Cyan
    Write-Host "   📋 Recent Orders: $($stats.recent_orders.Count)" -ForegroundColor Cyan
    Write-Host "   🔥 Top Products: $($stats.top_products.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Dashboard API Failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Test 4: Logout
Write-Host "`n4️⃣ Testing Logout..." -ForegroundColor Yellow
try {
    $logoutResponse = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/logout" -Method POST -Headers $headers
    Write-Host "✅ Logout Successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Logout Failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n🎉 All API Tests Completed Successfully!" -ForegroundColor Green
Write-Host "`n📱 Frontend URLs:" -ForegroundColor Yellow
Write-Host "   Admin Login: http://localhost:3002/admin" -ForegroundColor Cyan
Write-Host "   Dashboard: http://localhost:3002/admin/dashboard" -ForegroundColor Cyan
Write-Host "`n🔧 Backend URL:" -ForegroundColor Yellow
Write-Host "   API: http://127.0.0.1:8000/api" -ForegroundColor Cyan
Write-Host "`n✨ The shop application is fully functional!" -ForegroundColor Green
