<?php
require_once 'shop-backend/vendor/autoload.php';

// Load Laravel application
$app = require_once 'shop-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 EMAIL NOTIFICATION DIAGNOSIS\n";
echo "===============================\n\n";

// Check email configuration
echo "📧 Email Configuration:\n";
echo "MAIL_MAILER: " . env('MAIL_MAILER') . "\n";
echo "MAIL_HOST: " . env('MAIL_HOST') . "\n";
echo "MAIL_PORT: " . env('MAIL_PORT') . "\n";
echo "MAIL_USERNAME: " . env('MAIL_USERNAME') . "\n";
echo "MAIL_PASSWORD: " . (env('MAIL_PASSWORD') === 'your_real_gmail_app_password_here' ? '❌ NOT CONFIGURED' : '✅ CONFIGURED') . "\n";
echo "MAIL_ENCRYPTION: " . env('MAIL_ENCRYPTION') . "\n";
echo "MAIL_ADMIN_EMAIL: " . env('MAIL_ADMIN_EMAIL') . "\n\n";

// Check orders
echo "📦 Recent Orders:\n";
$orders = App\Models\Order::latest()->take(5)->get();
echo "Total orders in database: " . App\Models\Order::count() . "\n\n";

if ($orders->count() > 0) {
    foreach ($orders as $order) {
        echo "Order #{$order->id}:\n";
        echo "  Customer: {$order->client_name} {$order->client_lastname}\n";
        echo "  Email: {$order->email}\n";
        echo "  Created: {$order->created_at}\n";
        echo "  Status: {$order->status}\n\n";
    }
} else {
    echo "No orders found in database.\n\n";
}

// Check notifications
echo "🔔 Admin Notifications:\n";
$notifications = App\Models\AdminNotification::latest()->take(5)->get();
echo "Total notifications: " . App\Models\AdminNotification::count() . "\n";
echo "Unread notifications: " . App\Models\AdminNotification::where('is_read', false)->count() . "\n\n";

if ($notifications->count() > 0) {
    foreach ($notifications as $notification) {
        echo "Notification #{$notification->id}:\n";
        echo "  Title: {$notification->title}\n";
        echo "  Message: {$notification->message}\n";
        echo "  Priority: {$notification->priority}\n";
        echo "  Read: " . ($notification->is_read ? 'Yes' : 'No') . "\n";
        echo "  Created: {$notification->created_at}\n\n";
    }
} else {
    echo "No notifications found.\n\n";
}

// Check if email password is configured
if (env('MAIL_PASSWORD') === 'your_real_gmail_app_password_here') {
    echo "❌ PROBLEM FOUND:\n";
    echo "==================\n";
    echo "Gmail App Password is NOT configured!\n";
    echo "This is why you're not receiving email notifications.\n\n";
    echo "🔧 SOLUTION:\n";
    echo "1. Run: setup-gmail-app-password.bat\n";
    echo "2. Or open: fix-email-notifications.html\n";
    echo "3. Follow the Gmail App Password setup steps\n\n";
} else {
    echo "✅ Gmail App Password appears to be configured.\n";
    echo "If you're still not receiving emails, check:\n";
    echo "1. Gmail spam/junk folder\n";
    echo "2. Laravel logs: storage/logs/laravel.log\n";
    echo "3. Create a test order to trigger email\n\n";
}

echo "🧪 TESTING RECOMMENDATIONS:\n";
echo "1. Open: fix-email-notifications.html\n";
echo "2. Test email configuration\n";
echo "3. Create a test order\n";
echo "4. Check Gmail inbox\n\n";

echo "✅ Diagnosis complete!\n";
?>
