# Simple API test script
Write-Host "Testing Laravel backend API..." -ForegroundColor Yellow

# Test 1: Basic connectivity
Write-Host "`n1. Testing basic connectivity..." -ForegroundColor Blue
try {
    $response = Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/test-db" -Method GET
    Write-Host "Backend is responding" -ForegroundColor Green
    Write-Host "Categories: $($response.categories_count)" -ForegroundColor White
    Write-Host "Products: $($response.products_count)" -ForegroundColor White
} catch {
    Write-Host "Backend connection failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Admin login
Write-Host "`n2. Testing admin login..." -ForegroundColor Blue
try {
    $loginData = @{
        email = "admin@shop.com"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/admin/login" -Method POST -Body $loginData -ContentType "application/json"
    Write-Host "Admin login successful" -ForegroundColor Green
    $token = $loginResponse.token
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor White
} catch {
    Write-Host "Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Orders API
Write-Host "`n3. Testing orders API..." -ForegroundColor Blue
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $ordersResponse = Invoke-RestMethod -Uri "http://127.0.0.1:8001/api/admin/orders" -Method GET -Headers $headers
    Write-Host "Orders API successful" -ForegroundColor Green
    Write-Host "Orders found: $($ordersResponse.data.Count)" -ForegroundColor White
    Write-Host "Total orders: $($ordersResponse.pagination.total)" -ForegroundColor White
} catch {
    Write-Host "❌ Orders API failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

Write-Host "`nAPI test completed!" -ForegroundColor Magenta
