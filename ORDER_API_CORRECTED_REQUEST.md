# Order API Test - Corrected Request Examples

## ❌ Your Current Request (Missing Required Fields)
```json
{
  "payment_method": "cod",
  "client_name": "JHCSX",
  "client_lastname": "QLSKJC", 
  "products_id": 2
}
```

## ✅ Corrected Request - Guest Order (COD)
```json
{
  "products_id": 2,
  "client_name": "JHCSX",
  "client_lastname": "QLSKJC",
  "email": "jhcsx@example.com",
  "phone": "+1234567890",
  "method_payment": "Cash on Delivery",
  "payment_method": "cod",
  "date_arrival": "2025-01-15"
}
```

## ✅ Corrected Request - Guest Order (Online Payment)
```json
{
  "products_id": 2,
  "client_name": "JHCSX", 
  "client_lastname": "QLSKJC",
  "email": "jhcsx@example.com",
  "phone": "+1234567890",
  "method_payment": "PayPal",
  "payment_method": "online",
  "date_arrival": "2025-01-15"
}
```

## 📋 Required Fields Explanation

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `products_id` | integer | Product ID (must exist in database) | `2` |
| `client_name` | string | Customer first name | `"JHCSX"` |
| `client_lastname` | string | Customer last name | `"QLSKJC"` |
| `email` | email | Customer email address | `"jhcsx@example.com"` |
| `phone` | string | Customer phone number | `"+1234567890"` |
| `method_payment` | string | Payment method description | `"Cash on Delivery"` |
| `payment_method` | enum | Payment type | `"cod"` or `"online"` |

## 📋 Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `date_arrival` | date | Expected delivery date | `"2025-01-15"` |
| `status` | enum | Order status | `"new"` (default) |
| `payment_status` | enum | Payment status | `"pending"` (auto-set) |

## 🧪 Test with curl

### COD Order
```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "products_id": 2,
    "client_name": "JHCSX",
    "client_lastname": "QLSKJC", 
    "email": "jhcsx@example.com",
    "phone": "+1234567890",
    "method_payment": "Cash on Delivery",
    "payment_method": "cod"
  }'
```

### Online Payment Order
```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "products_id": 2,
    "client_name": "JHCSX",
    "client_lastname": "QLSKJC",
    "email": "jhcsx@example.com", 
    "phone": "+1234567890",
    "method_payment": "PayPal",
    "payment_method": "online"
  }'
```

## ✅ Expected Success Response
```json
{
    "success": true,
    "message": "Order created successfully",
    "data": {
        "order_id": 123,
        "order_number": "#ORD-0123",
        "status": "new",
        "payment_method": "cod",
        "payment_status": "pending",
        "customer_type": "guest",
        "customer_id": null,
        "total": "$199.99",
        "order": {
            "id": 123,
            "products_id": 2,
            "client_id": null,
            "client_name": "JHCSX",
            "client_lastname": "QLSKJC",
            "email": "jhcsx@example.com",
            "phone": "+1234567890",
            "method_payment": "Cash on Delivery",
            "payment_method": "cod",
            "payment_status": "pending",
            "status": "new",
            "created_at": "2025-07-11T10:30:00.000000Z"
        }
    }
}
```
