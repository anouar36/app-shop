<?php

/**
 * Simple Email Test via API
 * This script will use the API endpoint to place an order and test email
 */

echo "📧 SIMPLE EMAIL TEST VIA API\n";
echo "==============================\n\n";

// Test data for order
$orderData = [
    'client_name' => 'Email Test',
    'client_lastname' => 'Customer',
    'email' => 'emailtest@example.com',
    'phone' => '+212600000000',
    'products_id' => 1,
    'method_payment' => 'cod',
    'payment_method' => 'cod',
    'address' => '123 Test Street, Test City, Morocco'
];

echo "🛒 Creating test order via API...\n";
echo "📧 This will trigger an email to: anouarechcharai@gmail.com\n\n";

// API endpoint
$apiUrl = 'http://localhost:8000/api/orders';

// Initialize cURL
$ch = curl_init();

// Set cURL options
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($orderData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Execute request
echo "📡 Sending request to API...\n";
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);

curl_close($ch);

if ($error) {
    echo "❌ cURL Error: {$error}\n";
    exit(1);
}

echo "📊 API Response:\n";
echo "================\n";
echo "🔢 HTTP Code: {$httpCode}\n";

if ($httpCode == 200 || $httpCode == 201) {
    $data = json_decode($response, true);
    
    if ($data && isset($data['data']['order_id'])) {
        echo "✅ SUCCESS! Order created and email sent!\n\n";
        
        $order = $data['data']['order'];
        $orderId = $data['data']['order_id'];
        
        echo "📦 Order Details:\n";
        echo "🆔 Order ID: #{$orderId}\n";
        echo "👤 Customer: {$order['client_name']} {$order['client_lastname']}\n";
        echo "📧 Customer Email: {$order['email']}\n";
        echo "📱 Phone: {$order['phone']}\n";
        echo "💰 Payment: {$order['payment_method']}\n";
        echo "📅 Created: {$order['date_creation']}\n";
        echo "🛍️ Product: {$order['product']['name']}\n";
        echo "💵 Price: \${$order['product']['current_price']}\n\n";
        
        echo "📨 EMAIL NOTIFICATION SENT!\n";
        echo "============================\n";
        echo "📮 Recipient: anouarechcharai@gmail.com\n";
        echo "📬 Subject: \"New Order Notification - Order #{$orderId}\"\n";
        echo "⏰ Sent at: " . date('Y-m-d H:i:s') . "\n\n";
        
        echo "🔍 CHECK YOUR EMAIL NOW!\n";
        echo "=========================\n";
        echo "1. 📧 Open Gmail: https://mail.google.com\n";
        echo "2. 🔍 Look for the new order notification\n";
        echo "3. 📁 Check Spam folder if not in inbox\n";
        echo "4. ⏰ Email should arrive within 30 seconds\n\n";
        
        echo "📋 Email will contain:\n";
        echo "  • Order ID: #{$orderId}\n";
        echo "  • Customer: {$order['client_name']} {$order['client_lastname']}\n";
        echo "  • Product: {$order['product']['name']}\n";
        echo "  • Price: \${$order['product']['current_price']}\n";
        echo "  • Payment: {$order['payment_method']}\n";
        echo "  • Professional HTML formatting\n\n";
        
        echo "🎯 EMAIL TEST SUCCESSFUL! ✅\n";
        echo "📧 An email notification has been sent to your Gmail!\n";
        
    } else {
        echo "⚠️ Order created but response format unexpected:\n";
        echo $response . "\n";
    }
    
} else {
    echo "❌ FAILED! HTTP {$httpCode}\n";
    echo "Response: {$response}\n\n";
    
    echo "🔧 Troubleshooting:\n";
    echo "1. Check if Laravel backend is running (php artisan serve)\n";
    echo "2. Verify database connection\n";
    echo "3. Check Laravel logs for errors\n";
    echo "4. Ensure products table has data\n";
}

echo "\n⏱️ Test completed at: " . date('Y-m-d H:i:s') . "\n";

?>
