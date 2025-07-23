<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== Testing Admin Orders API ===\n";

// 1. First get an admin token
$adminUser = App\Models\User::where('email', 'admin@shop.com')->first();
if (!$adminUser) {
    echo "❌ Admin user not found!\n";
    exit(1);
}

// Create a token for testing
$token = $adminUser->createToken('test-token', ['admin'])->plainTextToken;
echo "✅ Generated admin token: " . substr($token, 0, 20) . "...\n\n";

// 2. Test the orders API endpoint directly
echo "Testing GET /api/admin/orders...\n";

$baseUrl = 'http://127.0.0.1:8001';
$url = $baseUrl . '/api/admin/orders?page=1&per_page=15&status=all&search=&sort_by=created_at&sort_order=desc';

echo "URL: $url\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";

if ($error) {
    echo "❌ cURL Error: $error\n";
} else {
    $data = json_decode($response, true);
    
    if ($httpCode === 200) {
        echo "✅ API Response successful!\n";
        echo "Orders returned: " . count($data['data']) . "\n";
        echo "Total orders: " . $data['pagination']['total'] . "\n";
        echo "Current page: " . $data['pagination']['current_page'] . "\n";
        echo "Total pages: " . $data['pagination']['last_page'] . "\n\n";
        
        echo "First 3 orders:\n";
        foreach (array_slice($data['data'], 0, 3) as $order) {
            echo "- ID: {$order['id']}, Customer: {$order['customer']}, Created: {$order['created_at']}\n";
        }
    } else {
        echo "❌ API Error: $response\n";
    }
}

// 3. Test the exact same query the dashboard uses
echo "\n=== Testing Dashboard Query ===\n";
try {
    $orders = App\Models\Order::with(['client', 'product'])
        ->orderBy('created_at', 'desc')
        ->paginate(15);
    
    echo "Direct database query results:\n";
    echo "Total orders: " . $orders->total() . "\n";
    echo "Current page orders: " . $orders->count() . "\n";
    
    echo "Latest orders:\n";
    foreach ($orders->take(5) as $order) {
        echo "- ID: {$order->id}, Name: {$order->client_name} {$order->client_lastname}, Created: {$order->created_at}\n";
    }
} catch (Exception $e) {
    echo "❌ Database query error: " . $e->getMessage() . "\n";
}
