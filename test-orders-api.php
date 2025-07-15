<?php
// Test admin login and orders API
require_once 'shop-backend/vendor/autoload.php';

use App\Models\User;
use App\Models\Order;

// Check if admin user exists
$admin = User::whereHas('role', function($q) {
    $q->where('role_name', 'admin');
})->first();

echo "Admin user exists: " . ($admin ? "Yes" : "No") . "\n";
if ($admin) {
    echo "Admin email: " . $admin->email . "\n";
}

// Check orders count
$ordersCount = Order::count();
echo "Orders in database: " . $ordersCount . "\n";

// Test admin login
if ($admin) {
    $url = 'http://127.0.0.1:8001/api/admin/login';
    $data = [
        'email' => 'admin@shop.com',
        'password' => 'admin123'
    ];
    
    $options = [
        'http' => [
            'header' => "Content-type: application/json\r\n",
            'method' => 'POST',
            'content' => json_encode($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    if ($result === FALSE) {
        echo "Login request failed\n";
    } else {
        $response = json_decode($result, true);
        echo "Login response: " . json_encode($response) . "\n";
        
        if (isset($response['token'])) {
            $token = $response['token'];
            echo "Token received: " . substr($token, 0, 20) . "...\n";
            
            // Test orders API with token
            $ordersUrl = 'http://127.0.0.1:8001/api/admin/orders';
            $ordersOptions = [
                'http' => [
                    'header' => "Authorization: Bearer $token\r\nContent-type: application/json\r\n",
                    'method' => 'GET'
                ]
            ];
            
            $ordersContext = stream_context_create($ordersOptions);
            $ordersResult = file_get_contents($ordersUrl, false, $ordersContext);
            
            if ($ordersResult === FALSE) {
                echo "Orders request failed\n";
                echo "HTTP response headers: " . print_r($http_response_header, true) . "\n";
            } else {
                $ordersResponse = json_decode($ordersResult, true);
                echo "Orders API response: " . json_encode($ordersResponse) . "\n";
            }
        }
    }
}
?>
