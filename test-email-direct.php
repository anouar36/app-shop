<?php

/**
 * Direct Email Test Script
 * This script will place a test order and send an email notification
 * to verify that emails are working correctly
 */

echo "📧 DIRECT EMAIL MESSAGE TEST\n";
echo "============================\n\n";

// Include Laravel bootstrap
require_once __DIR__ . '/shop-backend/vendor/autoload.php';

$app = require_once __DIR__ . '/shop-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Mail\OrderNotification;
use Illuminate\Support\Facades\Mail;

echo "🔧 Step 1: Checking Email Configuration\n";
echo "========================================\n";

// Check email configuration
$mailDriver = config('mail.default');
$mailHost = config('mail.mailers.smtp.host');
$mailUsername = config('mail.mailers.smtp.username');
$mailFrom = config('mail.from.address');
$adminEmail = config('mail.admin_email');

echo "✅ Mail Driver: {$mailDriver}\n";
echo "🌐 SMTP Host: {$mailHost}\n";
echo "👤 SMTP Username: {$mailUsername}\n";
echo "📧 From Address: {$mailFrom}\n";
echo "👨‍💼 Admin Email: {$adminEmail}\n\n";

echo "🔍 Step 2: Getting Admin Emails Dynamically\n";
echo "============================================\n";

try {
    $adminEmails = User::getAdminEmails();
    $primaryAdmin = User::getPrimaryAdminEmail();
    
    echo "✅ Dynamic admin lookup: SUCCESS\n";
    echo "📧 Admin emails found: " . count($adminEmails) . "\n";
    
    if (!empty($adminEmails)) {
        foreach ($adminEmails as $index => $email) {
            $isPrimary = $index === 0 ? " (Primary)" : "";
            echo "  📧 {$email}{$isPrimary}\n";
        }
    } else {
        echo "⚠️ No admin emails found - using fallback\n";
        echo "🛡️ Fallback email: {$primaryAdmin}\n";
    }
    echo "\n";
} catch (Exception $e) {
    echo "❌ Admin email lookup failed: " . $e->getMessage() . "\n\n";
    exit(1);
}

echo "🛒 Step 3: Creating Test Order\n";
echo "===============================\n";

try {
    // Create a test order
    $order = new Order();    $order->client_name = 'Email Test';
    $order->client_lastname = 'Customer';
    $order->email = 'emailtest@example.com';
    $order->phone = '+212600000000';
    $order->products_id = 1; // Correct column name
    $order->payment_method = 'cod';
    $order->payment_status = 'pending';
    $order->payment_code = 'COD-' . time();
    $order->address = '123 Test Street, Test City, Morocco';
    $order->status = 'pending';
    $order->date_creation = now();
    $order->client_id = null; // Guest order
    
    $order->save();
    
    echo "✅ Test order created successfully\n";
    echo "🆔 Order ID: #{$order->id}\n";
    echo "👤 Customer: {$order->client_name} {$order->client_lastname}\n";
    echo "📧 Customer Email: {$order->email}\n";
    echo "💰 Payment Method: {$order->payment_method}\n";
    echo "📅 Created: {$order->date_creation}\n\n";
    
} catch (Exception $e) {
    echo "❌ Failed to create test order: " . $e->getMessage() . "\n\n";
    exit(1);
}

echo "📨 Step 4: Sending Email Notification\n";
echo "======================================\n";

try {
    // Load order with relationships
    $order->load(['client', 'product']);
    
    // Get admin emails
    $adminEmails = User::getAdminEmails();
    
    if (empty($adminEmails)) {
        $adminEmails = [config('mail.admin_email', 'admin@ayoube.ma')];
        echo "⚠️ Using fallback email: {$adminEmails[0]}\n";
    }
    
    echo "📮 Sending email to " . count($adminEmails) . " admin(s):\n";
    
    $successCount = 0;
    $failureCount = 0;
    
    foreach ($adminEmails as $adminEmail) {
        try {
            echo "📧 Sending to: {$adminEmail}... ";
            
            Mail::to($adminEmail)->send(new OrderNotification($order));
            
            echo "✅ SUCCESS\n";
            $successCount++;
            
        } catch (Exception $e) {
            echo "❌ FAILED: " . $e->getMessage() . "\n";
            $failureCount++;
        }
    }
    
    echo "\n📊 Email Sending Results:\n";
    echo "✅ Successful: {$successCount}\n";
    echo "❌ Failed: {$failureCount}\n";
    echo "📧 Total Attempted: " . count($adminEmails) . "\n\n";
    
    if ($successCount > 0) {
        echo "🎯 SUCCESS! Email(s) sent successfully!\n";
        echo "📮 Check your email inbox: anouarechcharai@gmail.com\n";
        echo "🔍 Subject: \"New Order Notification - Order #{$order->id}\"\n";
        echo "⏰ Email should arrive within 1-2 minutes\n\n";
        
        echo "📋 What the email contains:\n";
        echo "  • Order ID: #{$order->id}\n";
        echo "  • Customer: {$order->client_name} {$order->client_lastname}\n";
        echo "  • Email: {$order->email}\n";
        echo "  • Phone: {$order->phone}\n";
        echo "  • Payment: {$order->payment_method}\n";
        echo "  • Status: {$order->status}\n";
        echo "  • Professional HTML formatting\n\n";
    } else {
        echo "❌ All email attempts failed!\n";
        echo "🔧 Check your email configuration:\n";
        echo "  • SMTP settings in .env file\n";
        echo "  • Gmail App Password\n";
        echo "  • Internet connection\n";
        echo "  • Laravel logs for detailed errors\n\n";
    }
    
} catch (Exception $e) {
    echo "❌ Email sending failed: " . $e->getMessage() . "\n\n";
}

echo "🧹 Step 5: Cleanup (Optional)\n";
echo "==============================\n";
echo "📝 Test order #{$order->id} has been created\n";
echo "🗑️ You can delete it later if needed\n";
echo "💾 Or keep it for testing purposes\n\n";

echo "✅ EMAIL TEST COMPLETED!\n";
echo "=========================\n";
echo "📧 If emails were sent successfully, check your Gmail inbox:\n";
echo "   📮 anouarechcharai@gmail.com\n";
echo "   🔍 Look for: \"New Order Notification - Order #{$order->id}\"\n";
echo "   📁 Check Spam folder if not in inbox\n";
echo "   ⏰ Email should arrive within 1-2 minutes\n\n";

echo "🎯 Test completed at: " . date('Y-m-d H:i:s') . "\n";

?>
