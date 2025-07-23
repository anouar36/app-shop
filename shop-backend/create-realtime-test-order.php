<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Order;
use App\Services\WhatsAppRealTimeService;

echo "=== Creating Real-Time Test Order ===\n";

// Create a test order
$order = new Order();
$order->products_id = 1;
$order->client_name = 'Ahmed';
$order->client_lastname = 'RealTime';
$order->email = 'ahmed.realtime@example.com';
$order->phone = '212639383709';
$order->method_payment = 'Cash on Delivery';
$order->payment_method = 'cod';
$order->date_creation = now();  // Add required field
$order->status = 'new';
$order->save();

echo "✅ Real-time test order created: Order #{$order->id}\n";
echo "   Customer: {$order->client_name} {$order->client_lastname}\n";
echo "   Phone: {$order->phone}\n";
echo "   Status: {$order->status}\n\n";

// Track the WhatsApp message for real-time processing
$realTimeService = new WhatsAppRealTimeService();
$realTimeService->trackSentMessage($order, 'order_confirmation');

echo "📱 WhatsApp message tracked for REAL-TIME processing\n\n";

echo "🎯 Now the REAL-TIME system will:\n";
echo "   1. Detect this order has a sent WhatsApp message (every 30 seconds)\n";
echo "   2. Simulate customer confirmation detection (90% chance)\n";
echo "   3. Update status from 'new' to 'processing' INSTANTLY\n";
echo "   4. Send instant confirmation message to customer\n\n";

echo "⚡ The real-time scheduler will process this automatically every 30 seconds!\n";
echo "🔍 Watch the order status change in real-time!\n\n";

echo "🚀 To manually trigger real-time processing:\n";
echo "   php artisan whatsapp:process-realtime\n";

?>
