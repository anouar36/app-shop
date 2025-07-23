<?php
require_once 'shop-backend/vendor/autoload.php';

// Load Laravel environment
$app = require_once 'shop-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Order;
use App\Services\WhatsAppAutoConfirmService;

echo "=== Creating Test Order for Automatic System ===\n\n";

// Create a test order with "new" status
$order = Order::create([
    'client_name' => 'Automatic',
    'client_lastname' => 'Test',
    'email' => 'autotest@example.com',
    'phone' => '+212639383709',
    'products_id' => 1,
    'method_payment' => 'Cash on Delivery',
    'payment_method' => 'cod',
    'status' => 'new'
]);

echo "✅ Created test order #{$order->id}\n";
echo "   Customer: {$order->client_name} {$order->client_lastname}\n";
echo "   Phone: {$order->phone}\n";
echo "   Status: {$order->status}\n\n";

// Track the WhatsApp message (simulate sending)
$autoConfirmService = new WhatsAppAutoConfirmService();
$autoConfirmService->trackSentMessage($order, 'order_confirmation');

echo "📱 WhatsApp message tracked for automatic processing\n\n";

echo "🎯 Now the automatic system will:\n";
echo "   1. Detect this order has a sent WhatsApp message\n";
echo "   2. Simulate customer confirmation detection\n";
echo "   3. Update status from 'new' to 'processing'\n";
echo "   4. Send confirmation message to customer\n\n";

echo "⚡ Run the auto-confirmation command: php artisan whatsapp:process-confirmations\n";

?>
