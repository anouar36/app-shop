<?php
require_once 'shop-backend/vendor/autoload.php';

// Load Laravel environment
$app = require_once 'shop-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Order;
use App\Services\WhatsAppService;

echo "=== Testing WhatsApp Webhook Handler Directly ===\n\n";

// Get the most recent "new" order
$order = Order::where('status', 'new')->orderBy('created_at', 'desc')->first();

if (!$order) {
    echo "❌ No orders with 'new' status found. Creating a test order...\n\n";
    
    // Create a test order
    $order = Order::create([
        'client_name' => 'Test',
        'client_lastname' => 'Customer',
        'email' => 'test@example.com',
        'phone' => '+212639383709',
        'products_id' => 1,
        'method_payment' => 'Cash on Delivery',
        'payment_method' => 'cod',
        'status' => 'new'
    ]);
    
    echo "✅ Created test order #{$order->id}\n\n";
}

echo "Testing with Order #{$order->id}:\n";
echo "  Customer: {$order->client_name} {$order->client_lastname}\n";
echo "  Phone: {$order->phone}\n";
echo "  Status: {$order->status}\n\n";

// Simulate WhatsApp webhook payload
$webhookPayload = [
    "entry" => [[
        "changes" => [[
            "value" => [
                "messages" => [[
                    "from" => "212639383709", // This should match the order phone
                    "text" => [
                        "body" => "CONFIRM"
                    ],
                    "timestamp" => time()
                ]]
            ]
        ]]
    ]]
];

echo "Simulating WhatsApp webhook with payload:\n";
echo json_encode($webhookPayload, JSON_PRETTY_PRINT) . "\n\n";

// Test the webhook handler directly
$whatsappService = new WhatsAppService();
$result = $whatsappService->handleWebhook($webhookPayload);

echo "Webhook Handler Result: " . ($result ? "✅ SUCCESS" : "❌ FAILED") . "\n\n";

// Check if order status was updated
$updatedOrder = Order::find($order->id);
echo "Order Status After Webhook:\n";
echo "  Before: {$order->status}\n";
echo "  After:  {$updatedOrder->status}\n\n";

if ($updatedOrder->status === 'processing') {
    echo "🎉 SUCCESS! Order status updated from 'new' to 'processing'\n";
    echo "✅ The WhatsApp webhook system is working correctly!\n\n";
    echo "🔍 CONCLUSION: The issue is that the webhook is not configured in production.\n";
    echo "   Facebook/WhatsApp is not sending webhook notifications to your server.\n\n";
} else {
    echo "❌ FAILED! Order status was not updated.\n";
    echo "🔍 Need to debug the webhook handler logic.\n\n";
}

// Test with different message formats
echo "Testing different message formats:\n";
echo "================================\n";

$testMessages = ['CONFIRM', 'confirm', 'Confirm', 'CANCEL', 'cancel'];

foreach ($testMessages as $messageText) {
    $testPayload = [
        "entry" => [[
            "changes" => [[
                "value" => [
                    "messages" => [[
                        "from" => "212639383709",
                        "text" => ["body" => $messageText]
                    ]]
                ]
            ]]
        ]]
    ];
    
    $result = $whatsappService->handleWebhook($testPayload);
    echo "Message '{$messageText}': " . ($result ? "✅ Processed" : "❌ Ignored") . "\n";
}

?>
