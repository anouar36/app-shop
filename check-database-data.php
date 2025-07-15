<?php
// Quick test to check if product ID 2 exists and what data we have

echo "=== Product and Database Check ===\n";

try {
    // Include Laravel bootstrap
    require_once __DIR__ . '/shop-backend/vendor/autoload.php';
    $app = require_once __DIR__ . '/shop-backend/bootstrap/app.php';
    $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

    echo "✅ Laravel loaded successfully\n";

    // Check products table
    $products = \App\Models\Product::all();
    echo "📦 Total products in database: " . $products->count() . "\n";

    if ($products->count() > 0) {
        echo "\n🔍 Available Products:\n";
        foreach ($products as $product) {
            echo "- ID: {$product->id}, Name: {$product->name}, Price: {$product->price}\n";
        }
    }

    // Check if product ID 2 specifically exists
    $product2 = \App\Models\Product::find(2);
    if ($product2) {
        echo "\n✅ Product ID 2 exists:\n";
        echo "- Name: {$product2->name}\n";
        echo "- Price: {$product2->price}\n";
        echo "- Category ID: {$product2->category_id}\n";
    } else {
        echo "\n❌ Product ID 2 does NOT exist!\n";
        echo "This could be causing the validation error.\n";
    }

    // Check categories
    $categories = \App\Models\Category::all();
    echo "\n📂 Total categories: " . $categories->count() . "\n";

    // Check users
    $users = \App\Models\User::all();
    echo "👥 Total users: " . $users->count() . "\n";

    // Check existing orders
    $orders = \App\Models\Order::all();
    echo "📋 Total orders: " . $orders->count() . "\n";

    if ($orders->count() > 0) {
        echo "\n📋 Recent Orders:\n";
        $recentOrders = \App\Models\Order::orderBy('id', 'desc')->limit(3)->get();
        foreach ($recentOrders as $order) {
            echo "- Order ID: {$order->id}, Product ID: {$order->products_id}, Customer: {$order->client_name} {$order->client_lastname}\n";
        }
    }

} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

echo "\n=== End Check ===\n";
?>
