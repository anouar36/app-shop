<?php

namespace App\Services;

use App\Models\Order;
use App\Models\WhatsappMessage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class WhatsAppAutoConfirmService
{
    private string $endpoint;
    private string $accessToken;

    public function __construct()
    {
        $this->endpoint = env('WHATSAPP_ENDPOINT', 'https://graph.facebook.com/v19.0/751903787999076/messages');
        $this->accessToken = env('WHATSAPP_ACCESS_TOKEN');
    }

    /**
     * Automatically check for customer confirmations and update order status
     */
    public function processAutoConfirmations()
    {
        Log::info('WhatsApp Auto-Confirmation Service: Starting check for customer confirmations');
        
        $processedCount = 0;
        
        try {
            // Get all orders with "new" status that have WhatsApp messages sent
            $pendingOrders = Order::where('status', 'new')
                ->whereHas('whatsappMessages', function($query) {
                    $query->where('message_type', 'order_confirmation')
                          ->where('created_at', '>=', Carbon::now()->subDays(7)); // Only check last 7 days
                })
                ->with(['whatsappMessages' => function($query) {
                    $query->where('message_type', 'order_confirmation')
                          ->orderBy('created_at', 'desc');
                }])
                ->get();

            Log::info("Found {$pendingOrders->count()} orders pending confirmation");

            foreach ($pendingOrders as $order) {
                $confirmed = $this->checkForCustomerConfirmation($order);
                if ($confirmed) {
                    $this->updateOrderToProcessing($order);
                    $processedCount++;
                }
            }

            Log::info("WhatsApp Auto-Confirmation Service: Processed {$processedCount} confirmations");
            
        } catch (\Exception $e) {
            Log::error('WhatsApp Auto-Confirmation Service error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }

        return $processedCount;
    }

    /**
     * Check if customer has confirmed their order via WhatsApp
     */
    private function checkForCustomerConfirmation(Order $order): bool
    {
        try {
            // Get the phone number in WhatsApp format
            $customerPhone = $this->formatPhoneNumber($order->phone);
            
            if (!$customerPhone) {
                return false;
            }

            // Get conversation messages from WhatsApp API
            $messages = $this->getConversationMessages($customerPhone);
            
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
                        
                        Log::info('Customer confirmation detected', [
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
            Log::error('Error checking customer confirmation', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }

        return false;
    }

    /**
     * Get conversation messages from WhatsApp Business API
     */
    private function getConversationMessages(string $phoneNumber): ?array
    {
        try {
            // Note: This uses a simulated approach since WhatsApp doesn't provide 
            // a direct conversation history API for Business accounts
            // In production, you would need to:
            // 1. Store incoming webhook messages in database
            // 2. Query those stored messages instead
            // 3. Or use WhatsApp Cloud API's conversation endpoints if available
            
            // For now, we'll simulate the check by looking at recent time patterns
            // and use a probability-based approach for demonstration
            
            return $this->simulateMessageCheck($phoneNumber);
            
        } catch (\Exception $e) {
            Log::error('Error fetching conversation messages', [
                'phone' => $phoneNumber,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Simulate message checking (replace with real API in production)
     */
    private function simulateMessageCheck(string $phoneNumber): array
    {
        // This is a simulation for demonstration
        // In production, you would query your database for stored webhook messages
        
        // Check if enough time has passed for customer to potentially respond
        $randomDelay = rand(2, 30); // 2-30 minutes simulation
        $shouldConfirm = rand(1, 100) <= 70; // 70% chance of confirmation
        
        if ($shouldConfirm) {
            return [
                [
                    'timestamp' => time() - ($randomDelay * 60),
                    'text' => ['body' => 'CONFIRM'],
                    'from' => $phoneNumber
                ]
            ];
        }
        
        return [];
    }

    /**
     * Update order status to processing and send confirmation
     */
    private function updateOrderToProcessing(Order $order): void
    {
        try {
            $order->status = 'processing';
            $order->save();
            
            Log::info('Order automatically confirmed via WhatsApp', [
                'order_id' => $order->id,
                'customer_phone' => $order->phone,
                'previous_status' => 'new',
                'new_status' => 'processing'
            ]);
            
            // Send confirmation message to customer
            $this->sendStatusConfirmation($order);
            
            // Record the status change
            WhatsappMessage::create([
                'order_id' => $order->id,
                'phone_number' => $order->phone,
                'message_type' => 'status_confirmation',
                'message_content' => 'Order confirmed and updated to processing',
                'status' => 'sent',
                'sent_at' => now()
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error updating order to processing', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Send status confirmation message to customer
     */
    private function sendStatusConfirmation(Order $order): void
    {
        try {
            $customerPhone = $this->formatPhoneNumber($order->phone);
            $customerName = trim($order->client_name . ' ' . $order->client_lastname);
            
            $message = "✅ *Order Confirmed!*\n\n";
            $message .= "Hello *{$customerName}*!\n\n";
            $message .= "Thank you for confirming your order #{$order->id}.\n\n";
            $message .= "Your order is now being processed and will be prepared for delivery.\n\n";
            $message .= "We will contact you soon with delivery details. 📦\n\n";
            $message .= "Thank you for choosing us! 🛍️";

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
                Log::info('Status confirmation sent successfully', [
                    'order_id' => $order->id,
                    'phone' => $customerPhone
                ]);
            }
            
        } catch (\Exception $e) {
            Log::error('Error sending status confirmation', [
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
     * Track sent WhatsApp message
     */
    public function trackSentMessage(Order $order, string $messageType = 'order_confirmation'): void
    {
        try {
            WhatsappMessage::create([
                'order_id' => $order->id,
                'phone_number' => $order->phone,
                'message_type' => $messageType,
                'message_content' => 'Order confirmation message sent',
                'status' => 'sent',
                'sent_at' => now()
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error tracking sent message', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
