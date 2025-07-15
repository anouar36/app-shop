# 🛒 E-Commerce Order API with Email Notifications - Postman Guide

## 📋 Overview

When you create a new order via Postman, the system will automatically:
1. ✅ Create the order in the database
2. 📧 Send a professional email notification to admin(s)
3. 📨 Include all customer and order details in the email

## 🚀 API Endpoint Details

### **POST** `/api/orders`
**URL**: `http://localhost:8000/api/orders`

### 📝 Request Headers
```json
{
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

### 📦 Request Body Examples

#### Example 1: Guest Order (Cash on Delivery)
```json
{
  "client_name": "Ahmed",
  "client_lastname": "Benali",
  "email": "ahmed.benali@gmail.com",
  "phone": "+212661234567",
  "products_id": 1,
  "method_payment": "cod",
  "payment_method": "cod",
  "address": "123 Rue Hassan II, Casablanca, Morocco"
}
```

#### Example 2: Guest Order (Online Payment)
```json
{
  "client_name": "Fatima",
  "client_lastname": "Alaoui",
  "email": "fatima.alaoui@hotmail.com",
  "phone": "+212665432198",
  "products_id": 1,
  "method_payment": "online",
  "payment_method": "online",
  "address": "456 Avenue Mohammed V, Rabat, Morocco"
}
```

#### Example 3: Authenticated User Order
```json
{
  "client_name": "Youssef",
  "client_lastname": "Tazi",
  "email": "youssef.tazi@yahoo.com",
  "phone": "+212667891234",
  "products_id": 1,
  "method_payment": "cod",
  "payment_method": "cod",
  "address": "789 Boulevard Zerktouni, Marrakech, Morocco"
}
```

## ✅ Expected API Response

### Success Response (HTTP 201)
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order_id": 25,
    "order_number": "#ORD-0025",
    "status": "new",
    "payment_method": "cod",
    "payment_status": "pending",
    "payment_code": null,
    "total": "$999.99",
    "customer_type": "guest",
    "customer_id": null,
    "order": {
      "products_id": 1,
      "client_name": "Ahmed",
      "client_lastname": "Benali",
      "email": "ahmed.benali@gmail.com",
      "phone": "+212661234567",
      "method_payment": "cod",
      "payment_method": "cod",
      "date_creation": "2025-07-11T17:15:30.000000Z",
      "status": "new",
      "client_id": null,
      "payment_status": "pending",
      "updated_at": "2025-07-11T17:15:30.000000Z",
      "created_at": "2025-07-11T17:15:30.000000Z",
      "id": 25,
      "client": null,
      "product": {
        "id": 1,
        "name": "iPhone 15 Pro",
        "category_id": 1,
        "price": "999.99",
        "current_price": "899.99",
        "description": "Latest iPhone with advanced features",
        "size": "6.1 inch"
      }
    }
  }
}
```

## 📧 Admin Email Notification

### Email Details
- **To**: `anouarechcharai@gmail.com` (dynamic from database)
- **From**: `Ayoube Shop <anouarechcharai@gmail.com>`
- **Subject**: `New Order Notification - Order #25`

### Email Content (HTML)
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order Notification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🛒 New Order Received!</h1>
        <p style="color: #f8f9fa; margin: 10px 0 0 0; font-size: 16px;">Order #25</p>
    </div>
    
    <div style="background: white; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Customer Information -->
        <div style="margin-bottom: 30px;">
            <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 15px;">
                👤 Customer Information
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #34495e; width: 30%;">Name:</td>
                    <td style="padding: 8px 0; color: #2c3e50;">Ahmed Benali</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                    <td style="padding: 8px 0; font-weight: bold; color: #34495e;">Email:</td>
                    <td style="padding: 8px 0; color: #2c3e50;">ahmed.benali@gmail.com</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #34495e;">Phone:</td>
                    <td style="padding: 8px 0; color: #2c3e50;">+212661234567</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                    <td style="padding: 8px 0; font-weight: bold; color: #34495e;">Customer Type:</td>
                    <td style="padding: 8px 0; color: #2c3e50;">Guest</td>
                </tr>
            </table>
        </div>
        
        <!-- Product Information -->
        <div style="margin-bottom: 30px;">
            <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 15px;">
                🛍️ Product Details
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #34495e; width: 30%;">Product:</td>
                    <td style="padding: 8px 0; color: #2c3e50;">iPhone 15 Pro</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                    <td style="padding: 8px 0; font-weight: bold; color: #34495e;">Price:</td>
                    <td style="padding: 8px 0; color: #2c3e50;">$899.99</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #34495e;">Description:</td>
                    <td style="padding: 8px 0; color: #2c3e50;">Latest iPhone with advanced features</td>
                </tr>
            </table>
        </div>
        
        <!-- Order Information -->
        <div style="margin-bottom: 30px;">
            <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; margin-bottom: 15px;">
                📦 Order Details
            </h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #34495e; width: 30%;">Order ID:</td>
                    <td style="padding: 8px 0; color: #2c3e50;">#25</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                    <td style="padding: 8px 0; font-weight: bold; color: #34495e;">Status:</td>
                    <td style="padding: 8px 0;"><span style="background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">PENDING</span></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #34495e;">Payment Method:</td>
                    <td style="padding: 8px 0; color: #2c3e50;">Cash on Delivery</td>
                </tr>
                <tr style="background-color: #f8f9fa;">
                    <td style="padding: 8px 0; font-weight: bold; color: #34495e;">Payment Status:</td>
                    <td style="padding: 8px 0;"><span style="background: #fff3cd; color: #856404; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">PENDING</span></td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #34495e;">Order Date:</td>
                    <td style="padding: 8px 0; color: #2c3e50;">July 11, 2025 at 5:15 PM</td>
                </tr>
            </table>
        </div>
        
        <!-- Action Required -->
        <div style="background: #e8f4fd; border: 1px solid #3498db; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
            <h3 style="color: #2980b9; margin: 0 0 10px 0;">⚡ Action Required</h3>
            <p style="color: #34495e; margin: 0; font-size: 14px;">
                This order requires your review and processing. Please check the admin dashboard to manage this order.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #7f8c8d; font-size: 12px; margin: 0;">
                This is an automated notification from Ayoube Shop<br>
                Generated on July 11, 2025 at 5:15 PM
            </p>
        </div>
    </div>
</body>
</html>
```

## 🧪 Postman Testing Steps

### Step 1: Setup Postman Request
1. **Method**: `POST`
2. **URL**: `http://localhost:8000/api/orders`
3. **Headers**:
   - `Content-Type`: `application/json`
   - `Accept`: `application/json`

### Step 2: Add Request Body
Copy one of the JSON examples above into the **Body** → **raw** → **JSON** section.

### Step 3: Send Request
Click **Send** button in Postman.

### Step 4: Check Response
- You should get HTTP 201 with order details
- Note the `order_id` in the response

### Step 5: Check Admin Email
- Open Gmail: https://mail.google.com
- Login to: `anouarechcharai@gmail.com`
- Look for: "New Order Notification - Order #[ID]"
- Check Spam folder if not in inbox

## 📊 Complete Test Example

Here's a complete curl command you can also use:

```bash
curl -X POST "http://localhost:8000/api/orders" \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-d '{
  "client_name": "Test Customer",
  "client_lastname": "From Postman",
  "email": "customer@test.com",
  "phone": "+212600123456",
  "products_id": 1,
  "method_payment": "cod",
  "payment_method": "cod",
  "address": "123 Test Street, Test City"
}'
```

## ✅ What Happens After Sending

1. **Order Created** ✅
2. **Database Updated** ✅  
3. **Admin Email Sent** 📧
4. **Response Returned** 📝

The email will arrive within 30 seconds and contain all the customer and order information in a professional format!

## 🔧 Troubleshooting

If you don't receive the email:
1. Check Laravel backend is running: `php artisan serve`
2. Verify Gmail settings in `.env` file
3. Check Spam/Junk folder
4. Look at Laravel logs for email errors

**The system is ready to use!** 🚀
