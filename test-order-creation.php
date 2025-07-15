<?php
/**
 * Test Order Creation and Email Notification
 * Simulates creating an order via API to test SMTP
 */

echo "<h1>🛒 Order Creation & Email Test</h1>\n";
echo "<div style='font-family: Arial, sans-serif; max-width: 800px; margin: 20px;'>\n";

// Test order data
$orderData = [
    'products_id' => 1,
    'client_name' => 'SMTP',
    'client_lastname' => 'Test',
    'email' => 'smtp.test@example.com',
    'phone' => '+1234567890',
    'method_payment' => 'Cash on Delivery',
    'payment_method' => 'cod'
];

echo "<h2>📝 Test Order Data:</h2>\n";
echo "<pre style='background: #f8f9fa; padding: 15px; border-radius: 5px;'>\n";
echo json_encode($orderData, JSON_PRETTY_PRINT);
echo "</pre>\n";

echo "<h2>🚀 API Test:</h2>\n";

// API endpoint
$apiUrl = 'http://localhost/shop/shop-backend/public/api/orders';

// Initialize cURL
$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => $apiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($orderData),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Accept: application/json'
    ],
    CURLOPT_TIMEOUT => 30
]);

$response = curl_exec($curl);
$httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
$error = curl_error($curl);

curl_close($curl);

if ($error) {
    echo "<p style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;'>";
    echo "❌ <strong>cURL Error:</strong> $error";
    echo "</p>\n";
} else {
    echo "<p><strong>HTTP Status Code:</strong> $httpCode</p>\n";
    
    if ($httpCode === 200 || $httpCode === 201) {
        echo "<p style='background: #d4edda; color: #155724; padding: 10px; border-radius: 5px;'>";
        echo "✅ <strong>Order Created Successfully!</strong>";
        echo "</p>\n";
        
        $responseData = json_decode($response, true);
        if ($responseData) {
            echo "<h3>📋 Order Response:</h3>\n";
            echo "<pre style='background: #f8f9fa; padding: 15px; border-radius: 5px;'>\n";
            echo json_encode($responseData, JSON_PRETTY_PRINT);
            echo "</pre>\n";
            
            if (isset($responseData['data']['order_id'])) {
                $orderId = $responseData['data']['order_id'];
                echo "<p style='background: #cce5ff; padding: 10px; border-radius: 5px;'>";
                echo "🎉 <strong>Order ID:</strong> #$orderId<br>";
                echo "📧 <strong>Email notification should be sent to:</strong> " . (getenv('MAIL_ADMIN_EMAIL') ?: 'anwar.class36flow@gmail.com');
                echo "</p>\n";
            }
        }
    } else {
        echo "<p style='background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px;'>";
        echo "❌ <strong>Order Creation Failed!</strong><br>";
        echo "HTTP Code: $httpCode<br>";
        echo "Response: " . htmlspecialchars($response);
        echo "</p>\n";
    }
}

echo "<h2>📧 Email Check Instructions:</h2>\n";
echo "<div style='background: #e2f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;'>\n";
echo "<ol>\n";
echo "<li>Check your email inbox: <strong>" . (getenv('MAIL_ADMIN_EMAIL') ?: 'anwar.class36flow@gmail.com') . "</strong></li>\n";
echo "<li>Look for an email with subject: <strong>🛒 New Order #[ID] - Action Required</strong></li>\n";
echo "<li>Check your spam/junk folder if you don't see it in inbox</li>\n";
echo "<li>The email should contain order details and customer information</li>\n";
echo "</ol>\n";
echo "</div>\n";

echo "<h2>🔧 Laravel Logs:</h2>\n";
echo "<p>Check the Laravel logs for email sending status:</p>\n";
echo "<pre style='background: #2d3748; color: #e2e8f0; padding: 15px; border-radius: 5px;'>\n";
echo "cd c:\\xampp\\htdocs\\shop\\shop-backend\n";
echo "Get-Content storage/logs/laravel.log -Tail 10\n";
echo "</pre>\n";

echo "<p style='text-align: center; margin-top: 30px;'>\n";
echo "<a href='test-smtp-configuration.php' style='background: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px; margin-right: 10px;'>Back to SMTP Test</a>\n";
echo "<a href='http://localhost/shop/shop-backend/public/api/admin/notifications/unread-count' style='background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;' target='_blank'>Check Notifications</a>\n";
echo "</p>\n";

echo "</div>\n";
?>
