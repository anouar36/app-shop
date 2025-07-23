<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Database Orders Check ===\n";

// Count total orders
$totalOrders = App\Models\Order::count();
echo "Total orders in database: {$totalOrders}\n\n";

// Get latest 10 orders
echo "Latest 10 orders:\n";
$orders = App\Models\Order::latest()->take(10)->get();

foreach ($orders as $order) {
    echo "ID: {$order->id} | Name: {$order->client_name} {$order->client_lastname} | Status: {$order->status} | Created: {$order->created_at}\n";
}

// Check today's orders
echo "\n=== Today's Orders ===\n";
$todaysOrders = App\Models\Order::whereDate('created_at', today())->get();
echo "Orders created today: " . $todaysOrders->count() . "\n";

foreach ($todaysOrders as $order) {
    echo "ID: {$order->id} | Name: {$order->client_name} {$order->client_lastname} | Created: {$order->created_at}\n";
}

// Check orders from last 24 hours
echo "\n=== Orders from last 24 hours ===\n";
$recentOrders = App\Models\Order::where('created_at', '>=', now()->subDay())->get();
echo "Orders in last 24 hours: " . $recentOrders->count() . "\n";

foreach ($recentOrders as $order) {
    echo "ID: {$order->id} | Name: {$order->client_name} {$order->client_lastname} | Created: {$order->created_at}\n";
}
