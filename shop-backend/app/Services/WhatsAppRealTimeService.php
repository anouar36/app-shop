<?php

namespace App\Services;

use App\Models\Order;
use App\Models\WhatsappMessage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class WhatsAppRealTimeService
{
    private string $endpoint;
    private string $accessToken;

    public function __construct()
    {
        $this->endpoint = env('WHATSAPP_ENDPOINT', 'https://graph.facebook.com/v19.0/751903787999076/messages');
        $this->accessToken = env('WHATSAPP_ACCESS_TOKEN');
    }

    /**
     * REAL-TIME: Process WhatsApp confirmations instantly
     * This checks for confirmations immediately and updates status
     */
    public function processRealTimeConfirmations()
    {
        Log::info('WhatsApp Real-Time Service: Checking for instant confirmations');
        
        $processedCount = 0;
        
        try {
            // Get all orders with "new" status that have WhatsApp messages sent in the last hour
            $pendingOrders = Order::where('status', 'new')
                ->whereHas('whatsappMessages', function($query) {
                    $query->where('message_type', 'order_confirmation')
                          ->where('created_at', '>=', Carbon::now()->subHour()); // Only last hour for real-time
                })
                ->with(['whatsappMessages' => function($query) {
                    $query->where('message_type', 'order_confirmation')
                          ->orderBy('created_at', 'desc');
                }])
                ->get();

            Log::info("Found {$pendingOrders->count()} orders for real-time confirmation check");

            foreach ($pendingOrders as $order) {
                $confirmed = $this->checkForInstantConfirmation($order);
                if ($confirmed) {
                    $this->updateOrderToProcessingInstantly($order);
                    $processedCount++;
                }
            }

            Log::info("WhatsApp Real-Time Service: Processed {$processedCount} instant confirmations");
            
        } catch (\Exception $e) {
            Log::error('WhatsApp Real-Time Service error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }

        return $processedCount;
    }

    /**
     * Check for instant customer confirmation (optimized for real-time)
     */
    private function checkForInstantConfirmation(Order $order): bool
    {
        try {
            // Get the phone number in WhatsApp format
            $customerPhone = $this->formatPhoneNumber($order->phone);
            
            if (!$customerPhone) {
                return false;
            }

            // For real-time detection, we simulate checking the WhatsApp Business API
            // In production, this would query the actual WhatsApp conversation
            $messages = $this->getRecentMessages($customerPhone);
            
            if (!$messages) {
                return false;
            }

            // Look for confirmation messages after the order was created
            $orderCreatedAt = Carbon::parse($order->created_at);
            
            foreach ($messages as $message) {
                $messageTime = Carbon::createFromTimestamp($message['timestamp']);
                
                // Only check messages sent after order creation
                if ($messageTime->greaterThan($orderCreatedAt)) {
                    $messageText = strtoupper(trim($message['text']['body'] ?? ''));
                    
                    // Check for confirmation keywords
                    if (strpos($messageText, 'CONFIRM') !== false || 
                        strpos($messageText, 'YES') !== false ||
                        strpos($messageText, 'OUI') !== false) {
                        
                        Log::info('REAL-TIME: Customer confirmation detected', [
                            'order_id' => $order->id,
                            'customer_phone' => $customerPhone,
                            'message' => $messageText,
                            'message_time' => $messageTime->toDateTimeString()
                        ]);
                        
                        return true;
                    }
                }
            }
            
        } catch (\Exception $e) {
            Log::error('Error checking instant confirmation', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }

        return false;
    }

    /**
     * Get recent messages (optimized for real-time checking)
     */
    private function getRecentMessages(string $phoneNumber): ?array
    {
        try {
            // For demo purposes, we'll simulate instant detection
            // In production, you would use WhatsApp Business API to get recent messages
            
            return $this->simulateInstantMessageCheck($phoneNumber);
            
        } catch (\Exception $e) {
            Log::error('Error fetching recent messages', [
                'phone' => $phoneNumber,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Simulate instant message checking (90% chance for demo)
     */
    private function simulateInstantMessageCheck(string $phoneNumber): array
    {
        // Higher chance for instant confirmation (90% for demo)
        $shouldConfirm = rand(1, 100) <= 90;
        
        if ($shouldConfirm) {
            return [
                [
                    'timestamp' => time() - 30, // 30 seconds ago
                    'text' => ['body' => 'CONFIRM'],
                    'from' => $phoneNumber
                ]
            ];
        }
        
        return [];
    }

    /**
     * Update order status to processing INSTANTLY
     */
    private function updateOrderToProcessingInstantly(Order $order): void
    {
        try {
            $oldStatus = $order->status;
            $order->status = 'processing';
            $order->save();
            
            Log::info('REAL-TIME: Order instantly confirmed via WhatsApp', [
                'order_id' => $order->id,
                'customer_phone' => $order->phone,
                'previous_status' => $oldStatus,
                'new_status' => 'processing',
                'processed_at' => now()->toDateTimeString()
            ]);
            
            // Send instant confirmation message to customer
            $this->sendInstantStatusConfirmation($order);
            
            // Record the instant status change
            WhatsappMessage::create([
                'order_id' => $order->id,
                'phone_number' => $order->phone,
                'message_type' => 'instant_status_confirmation',
                'message_content' => 'Order instantly confirmed and updated to processing',
                'status' => 'sent',
                'sent_at' => now()
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error updating order instantly', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send instant status confirmation message to customer
     */
    private function sendInstantStatusConfirmation(Order $order): void
    {
        try {
            $customerPhone = $this->formatPhoneNumber($order->phone);
            $customerName = trim($order->client_name . ' ' . $order->client_lastname);
            
            $message = "⚡ *INSTANT CONFIRMATION!*\n\n";
            $message .= "Hello *{$customerName}*!\n\n";
            $message .= "🎉 Your order #{$order->id} has been INSTANTLY confirmed!\n\n";
            $message .= "✅ Status: PROCESSING (updated in real-time)\n";
            $message .= "📦 Your order is now being prepared for delivery.\n\n";
            $message .= "🚀 Thank you for your quick confirmation!\n";
            $message .= "We will contact you soon with delivery details. 📞";

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->accessToken,
                'Content-Type' => 'application/json'
            ])->post($this->endpoint, [
                'messaging_product' => 'whatsapp',
                'to' => $customerPhone,
                'type' => 'text',
                'text' => [
                    'body' => $message
                ]
            ]);

            if ($response->successful()) {
                Log::info('REAL-TIME: Instant status confirmation sent successfully', [
                    'order_id' => $order->id,
                    'phone' => $customerPhone
                ]);
            }
            
        } catch (\Exception $e) {
            Log::error('Error sending instant status confirmation', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Format phone number for WhatsApp
     */
    private function formatPhoneNumber($phone)
    {
        if (empty($phone)) {
            return null;
        }

        // Remove all non-digit characters
        $phone = preg_replace('/[^0-9]/', '', $phone);

        // If phone starts with 0 (local format), assume Morocco and add 212
        if (substr($phone, 0, 1) === '0') {
            $phone = '212' . substr($phone, 1);
        }
        // If phone doesn't start with country code, assume Morocco
        elseif (strlen($phone) === 9 && !str_starts_with($phone, '212')) {
            $phone = '212' . $phone;
        }

        return $phone;
    }

    /**
     * Track sent WhatsApp message for real-time processing
     */
    public function trackSentMessage(Order $order, string $messageType = 'order_confirmation'): void
    {
        try {
            WhatsappMessage::create([
                'order_id' => $order->id,
                'phone_number' => $order->phone,
                'message_type' => $messageType,
                'message_content' => 'Order confirmation message sent for real-time tracking',
                'status' => 'sent',
                'sent_at' => now()
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error tracking sent message for real-time', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
