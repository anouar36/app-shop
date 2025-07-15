@echo off
echo Testing Order API with exact request data...
echo.

echo === Test 1: Check backend status ===
curl -X GET http://localhost:8000/api/test
echo.
echo.

echo === Test 2: Your exact request ===
curl -X POST http://localhost:8000/api/orders ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json" ^
  -d "{\"products_id\": 2, \"client_name\": \"JHCSX\", \"client_lastname\": \"QLSKJC\", \"email\": \"jhcsx@example.com\", \"phone\": \"+1234567890\", \"method_payment\": \"Cash on Delivery\", \"payment_method\": \"cod\"}"
echo.
echo.

echo === Test 3: Check with different product ID ===
curl -X POST http://localhost:8000/api/orders ^
  -H "Content-Type: application/json" ^
  -H "Accept: application/json" ^
  -d "{\"products_id\": 1, \"client_name\": \"JHCSX\", \"client_lastname\": \"QLSKJC\", \"email\": \"jhcsx@example.com\", \"phone\": \"+1234567890\", \"method_payment\": \"Cash on Delivery\", \"payment_method\": \"cod\"}"
echo.
echo.

echo === Test 4: Check products endpoint ===
curl -X GET http://localhost:8000/api/products
echo.
echo.

pause
