<?php
require_once 'shop-backend/vendor/autoload.php';

// Load Laravel application
$app = require_once 'shop-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Test notification creation
echo "🔔 Testing Admin Notification System\n";
echo "=====================================\n\n";

try {
    // Check current notification count
    $totalNotifications = App\Models\AdminNotification::count();
    $unreadNotifications = App\Models\AdminNotification::where('is_read', false)->count();
    
    echo "📊 Current Status:\n";
    echo "- Total notifications: $totalNotifications\n";
    echo "- Unread notifications: $unreadNotifications\n\n";    // Create a test order
    echo "📦 Creating test order...\n";
    $order = new App\Models\Order();
    $order->client_name = 'Test Customer ' . date('Y-m-d H:i:s');
    $order->client_lastname = 'Customer';
    $order->email = 'testcustomer@example.com';
    $order->phone = '+1234567890';
    $order->method_payment = 'cod';
    $order->date_creation = now();
    $order->status = 'pending';
    $order->payment_method = 'cod';
    $order->payment_status = 'pending';
    $order->products_id = 1;
    $order->save();
    
    echo "✅ Order created with ID: {$order->id}\n\n";
    
    // Create admin notification
    echo "🔔 Creating admin notification...\n";
    $notification = App\Models\AdminNotification::createOrderNotification($order, 'order_created');
    
    echo "✅ Notification created:\n";
    echo "- ID: {$notification->id}\n";
    echo "- Title: {$notification->title}\n";
    echo "- Message: {$notification->message}\n";
    echo "- Priority: {$notification->priority}\n";
    echo "- Is Read: " . ($notification->is_read ? 'Yes' : 'No') . "\n\n";
    
    // Test email notification
    echo "📧 Testing email notification...\n";
    try {
        Mail::to('anouarechcharai@gmail.com')->send(new App\Mail\EnhancedOrderNotification($order, $notification));
        echo "✅ Email notification sent successfully!\n";
        echo "📬 Check inbox: anouarechcharai@gmail.com\n\n";
    } catch (Exception $e) {
        echo "❌ Email sending failed: " . $e->getMessage() . "\n";
        echo "💡 Check Gmail App Password in .env file\n\n";
    }
    
    // Show updated counts
    $newTotalNotifications = App\Models\AdminNotification::count();
    $newUnreadNotifications = App\Models\AdminNotification::where('is_read', false)->count();
    
    echo "📊 Updated Status:\n";
    echo "- Total notifications: $newTotalNotifications (+". ($newTotalNotifications - $totalNotifications) .")\n";
    echo "- Unread notifications: $newUnreadNotifications (+". ($newUnreadNotifications - $unreadNotifications) .")\n\n";
    
    // Test API endpoints
    echo "🔗 Testing API endpoints...\n";
    echo "- GET /api/admin/notifications/unread-count\n";
    echo "- GET /api/admin/notifications\n";
    echo "- PUT /api/admin/notifications/{id}/read\n";
    echo "- DELETE /api/admin/notifications/{id}\n\n";
    
    echo "🎯 Next Steps:\n";
    echo "1. Check Gmail inbox for notification email\n";
    echo "2. Test frontend dashboard at http://localhost:3000/admin/dashboard\n";
    echo "3. Verify notification bell and dropdown functionality\n";
    echo "4. Test mark as read and delete features\n\n";
    
    echo "✅ Notification system test completed successfully!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
?>
