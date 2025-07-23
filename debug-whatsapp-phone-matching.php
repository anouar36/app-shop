<?php
require_once 'shop-backend/vendor/autoload.php';

// Load Laravel environment
$app = require_once 'shop-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Order;

echo "=== WhatsApp Phone Number Matching Debug ===\n\n";

// Check recent orders and their phone numbers
$orders = Order::orderBy('created_at', 'desc')->limit(10)->get();

echo "Recent Orders and Phone Numbers:\n";
echo "================================\n";
foreach ($orders as $order) {
    echo "Order #{$order->id}:\n";
    echo "  Customer: {$order->client_name} {$order->client_lastname}\n";
    echo "  Phone (stored): '{$order->phone}'\n";
    echo "  Status: {$order->status}\n";
    echo "  Created: {$order->created_at}\n";
    
    // Test phone number matching logic
    $testWhatsAppPhone = '212639383709'; // Example WhatsApp sender
    $last9Digits = substr($testWhatsAppPhone, -9);
    $matches = Order::where('phone', 'LIKE', '%' . $last9Digits)->where('id', $order->id)->exists();
    
    echo "  Last 9 digits of stored phone: " . substr($order->phone, -9) . "\n";
    echo "  Would match WhatsApp phone {$testWhatsAppPhone}? " . ($matches ? 'YES' : 'NO') . "\n";
    echo "\n";
}

echo "\nPhone Number Matching Test:\n";
echo "==========================\n";
$testCases = [
    '212639383709',  // WhatsApp format
    '+212639383709', // International format
    '0639383709',    // Local Morocco format
];

foreach ($testCases as $whatsappPhone) {
    echo "WhatsApp sender: {$whatsappPhone}\n";
    $last9 = substr($whatsappPhone, -9);
    echo "  Last 9 digits: {$last9}\n";
    
    $matchingOrders = Order::where('phone', 'LIKE', '%' . $last9)
                           ->where('status', 'new')
                           ->get();
    
    echo "  Matching 'new' orders: " . $matchingOrders->count() . "\n";
    foreach ($matchingOrders as $order) {
        echo "    - Order #{$order->id}: {$order->phone} (status: {$order->status})\n";
    }
    echo "\n";
}

echo "\nDebugging WhatsApp webhook message structure:\n";
echo "============================================\n";
echo "Expected webhook payload structure:\n";
$samplePayload = [
    "entry" => [[
        "changes" => [[
            "value" => [
                "messages" => [[
                    "from" => "212639383709",
                    "text" => [
                        "body" => "CONFIRM"
                    ]
                ]]
            ]
        ]]
    ]]
];
echo json_encode($samplePayload, JSON_PRETTY_PRINT) . "\n";

?>
