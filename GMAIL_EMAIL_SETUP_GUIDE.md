# 📧 Gmail Email Setup Guide for Order Notifications

## 🎯 Issue Solved
- ✅ Updated admin email to: `anouarechcharai@gmail.com`
- ✅ Configured Gmail SMTP settings
- ✅ Ready to send real emails instead of just logging

## 🔧 Gmail App Password Setup

To send emails from your Gmail account, you need to create an **App Password**:

### Step 1: Enable 2-Factor Authentication
1. Go to **Google Account Settings**: https://myaccount.google.com/
2. Click **Security** in the left menu
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the steps to enable 2FA if not already enabled

### Step 2: Generate App Password
1. Go to **Google Account Settings**: https://myaccount.google.com/
2. Click **Security** in the left menu
3. Under "Signing in to Google", click **App passwords**
4. Select app: **Mail**
5. Select device: **Other (custom name)** → Enter: "Ayoube Shop"
6. Click **Generate**
7. **Copy the 16-character password** (like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File
Replace `your_gmail_app_password_here` in the `.env` file:

```env
MAIL_PASSWORD=abcd efgh ijkl mnop
```

**Important**: Use the App Password, NOT your regular Gmail password!

## ⚙️ Current Configuration (.env)

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=anouarechcharai@gmail.com
MAIL_PASSWORD=your_gmail_app_password_here  # ← Replace this
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="anouarechcharai@gmail.com"
MAIL_FROM_NAME="Ayoube Shop"
MAIL_ADMIN_EMAIL=anouarechcharai@gmail.com
```

## 🧪 Testing Steps

### After setting up the App Password:

1. **Update .env** with your App Password
2. **Clear Laravel cache**: `php artisan config:clear`
3. **Test order creation** in Postman
4. **Check your Gmail inbox** for the notification

### Test Order Request (Postman):
```json
POST http://localhost:8000/api/orders
Content-Type: application/json

{
  "products_id": 2,
  "client_name": "Test",
  "client_lastname": "Customer",
  "email": "test@example.com",
  "phone": "+1234567890",
  "method_payment": "Cash on Delivery",
  "payment_method": "cod"
}
```

## 🎯 Expected Result

After creating an order, you should receive an email at `anouarechcharai@gmail.com` with:

**Subject**: `New Order Received - #ORD-0123 (Guest)`

**Content**: Complete order details including customer info, product details, payment method, etc.

## 🔍 Troubleshooting

### If emails still don't arrive:

1. **Check Spam/Junk folder** in Gmail
2. **Verify App Password** is correct (16 characters, no spaces in .env)
3. **Check Laravel logs**: `storage/logs/laravel.log` for email errors
4. **Test with Mailtrap** first (safer for testing)

### Alternative: Mailtrap (Testing)
For safe testing without real emails:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
MAIL_FROM_ADDRESS="test@example.com"
MAIL_ADMIN_EMAIL=anouarechcharai@gmail.com
```

## ⚡ Quick Commands

```powershell
# Clear Laravel cache after .env changes
cd c:\xampp\htdocs\shop\shop-backend
php artisan config:clear

# Check Laravel logs
Get-Content "c:\xampp\htdocs\shop\shop-backend\storage\logs\laravel.log" -Tail 20

# Test email configuration
php artisan tinker
Mail::raw('Test email', function($message) { $message->to('anouarechcharai@gmail.com')->subject('Test'); });
```

## 🎉 Success Checklist

- [ ] 2-Factor Authentication enabled on Gmail
- [ ] App Password generated and copied
- [ ] `.env` file updated with App Password
- [ ] Laravel cache cleared
- [ ] Test order created in Postman
- [ ] Email received at `anouarechcharai@gmail.com`

**Once you complete the Gmail App Password setup, you'll receive real email notifications for every order! 📧**
