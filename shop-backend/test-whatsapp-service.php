<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== WhatsApp Service Test ===\n";

try {
    echo "1. Testing WhatsApp service instantiation...\n";
    $whatsappService = new App\Services\WhatsAppService();
    echo "✅ WhatsApp service created successfully\n";
    
    echo "\n2. Testing sendCustomMessage method...\n";
    $result = $whatsappService->sendCustomMessage('+212639383709', 'Test message from Laravel');
    
    if ($result['success']) {
        echo "✅ WhatsApp message sent successfully\n";
        echo "Message ID: " . ($result['message_id'] ?? 'unknown') . "\n";
        echo "Phone: " . ($result['phone'] ?? 'unknown') . "\n";
    } else {
        echo "❌ WhatsApp message failed\n";
        echo "Error: " . json_encode($result['error']) . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

echo "\n=== Test Complete ===\n";
