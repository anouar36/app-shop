<?php
// Create a new order with phone number
require_once 'shop-backend/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'shop-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // Create a new order
    $order = new App\Models\Order();
    $order->client_id = 2; // Assuming client ID 2 exists
    $order->products_id = 1; // Assuming product ID 1 exists
    $order->client_name = 'Test';
    $order->client_lastname = 'Customer';
    $order->email = 'test.customer@example.com';
    $order->phone = '+1 (555) 123-4567';
    $order->method_payment = 'Credit Card';
    $order->date_creation = now();
    $order->date_arrival = now()->addDays(3);
    $order->status = 'new';
    
    $order->save();
    
    echo "Order created with ID: {$order->id}\n";
    
    // Test getting the order with customer phone
    $foundOrder = App\Models\Order::with(['client', 'product'])->find($order->id);
    
    echo "Order details:\n";
    echo "Customer: {$foundOrder->client_name} {$foundOrder->client_lastname}\n";
    echo "Email: {$foundOrder->email}\n";
    echo "Phone: {$foundOrder->phone}\n";
    echo "Status: {$foundOrder->status}\n";
    
    if ($foundOrder->client) {
        echo "Linked client: {$foundOrder->client->name} {$foundOrder->client->last_name}\n";
        echo "Client phone: " . ($foundOrder->client->phone ?? 'None') . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
