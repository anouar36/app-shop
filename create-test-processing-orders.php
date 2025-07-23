<?php

require_once 'shop-backend/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'shop-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Order;
use App\Models\Product;

echo "=== Creating Test Orders for AI Agent ===\n\n";

try {
    // Get a product to use for test orders
    $product = Product::first();
    if (!$product) {
        echo "❌ No products found! Please seed the database first.\n";
        exit;
    }

    echo "✅ Using product: {$product->name} (ID: {$product->id})\n\n";

    // Create 7 test orders with "processing" status
    $testOrders = [];
    for ($i = 1; $i <= 7; $i++) {
        $order = Order::create([
            'products_id' => $product->id,
            'client_name' => 'Test Customer ' . $i,
            'client_lastname' => 'Processing',
            'email' => "customer{$i}@example.com",
            'phone' => '+212' . str_pad($i, 9, '0', STR_PAD_LEFT),
            'delivery_address' => "{$i} Test Street, Processing City, Morocco",
            'method_payment' => $i % 2 == 0 ? 'Cash on Delivery' : 'Online Payment',
            'payment_method' => $i % 2 == 0 ? 'cod' : 'online',
            'payment_status' => 'pending',
            'status' => 'processing', // This is the key status
            'quantity' => rand(1, 3),
            'special_instructions' => "Special instructions for order {$i}",
            'delivery_notes' => "Delivery notes for order {$i}",
            'date_creation' => now(),
            'date_arrival' => now()->addDays(rand(2, 7))
        ]);

        $testOrders[] = $order;
        echo "✅ Created order #{$order->id} - {$order->client_name} {$order->client_lastname}\n";
    }

    echo "\n📊 Summary:\n";
    echo "Created " . count($testOrders) . " test orders with 'processing' status\n";
    
    // Check total processing orders
    $totalProcessingOrders = Order::where('status', 'processing')->count();
    echo "Total processing orders in database: {$totalProcessingOrders}\n";
    
    if ($totalProcessingOrders >= 5) {
        echo "🎯 AI Agent threshold met! (≥5 processing orders)\n";
        echo "The AI agent should now detect these orders and send a report.\n\n";
        
        echo "🚀 Next Steps:\n";
        echo "1. Test the AI agent: php artisan orders:ai-agent --force\n";
        echo "2. Check your email: " . env('MAIL_ADMIN_EMAIL', env('MAIL_FROM_ADDRESS')) . "\n";
        echo "3. Or test via API: POST /api/ai-agent/force-report\n";
    } else {
        echo "⚠️ Need more orders to trigger AI agent (current: {$totalProcessingOrders}, needed: 5+)\n";
    }

} catch (Exception $e) {
    echo "❌ Error creating test orders: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n=== Test Orders Creation Complete ===\n";
?>
