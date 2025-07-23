<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Order Creation Debug ===\n";

// Check if product ID 2 exists
echo "1. Checking if product ID 2 exists...\n";
try {
    $product = App\Models\Product::find(2);
    if ($product) {
        echo "✅ Product found: {$product->name} - {$product->price}\n";
    } else {
        echo "❌ Product with ID 2 not found\n";
        echo "Available products:\n";
        $products = App\Models\Product::all();
        foreach ($products as $p) {
            echo "  - ID: {$p->id}, Name: {$p->name}\n";
        }
    }
} catch (Exception $e) {
    echo "❌ Error checking product: " . $e->getMessage() . "\n";
}

// Test order creation directly
echo "\n2. Testing order creation...\n";
try {
    $orderData = [
        'products_id' => 1, // Use ID 1 instead
        'client_name' => 'Test',
        'client_lastname' => 'Customer',
        'email' => 'test@example.com',
        'phone' => '+212639383709',
        'method_payment' => 'Cash on Delivery',
        'payment_method' => 'cod',
        'date_creation' => now(),
        'status' => 'new'
    ];
    
    $order = App\Models\Order::create($orderData);
    echo "✅ Order created successfully with ID: {$order->id}\n";
    
} catch (Exception $e) {
    echo "❌ Error creating order: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

// Check WhatsApp service
echo "\n3. Testing WhatsApp service...\n";
try {
    $whatsappService = new App\Services\WhatsAppService();
    echo "✅ WhatsApp service instantiated successfully\n";
} catch (Exception $e) {
    echo "❌ Error with WhatsApp service: " . $e->getMessage() . "\n";
}

echo "\n=== Debug Complete ===\n";
