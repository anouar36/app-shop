<?php
require_once 'shop-backend/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'shop-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

try {
    // Get table columns
    $order = App\Models\Order::first();
    if ($order) {
        echo "Orders table columns:\n";
        $columns = array_keys($order->getAttributes());
        foreach ($columns as $column) {
            echo "- $column\n";
        }
    } else {
        echo "No orders found, creating a sample to check structure:\n";
        $fillable = (new App\Models\Order())->getFillable();
        echo "Fillable fields:\n";
        foreach ($fillable as $field) {
            echo "- $field\n";
        }
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
