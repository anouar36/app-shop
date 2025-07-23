<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Order;

class WhatsAppService
{
    private string $endpoint;
    private string $accessToken;

    public function __construct()
    {
        $this->endpoint = env('WHATSAPP_ENDPOINT', 'https://graph.facebook.com/v19.0/751903787999076/messages');
        $this->accessToken = env('WHATSAPP_ACCESS_TOKEN', 'EAAI67Ip2YMcBPPatSMMXRZCbcaCWGB6hyyJKRBZBOYFSZB3qsmidKX8xt1JixjojxB34OxkjERLXphrGxcWLEXdZB7VpIx4OZBag2kk7dSZBLE7ept7NntgMXQqiBYsY1wrIZB1QPpuQFaQWOCZCzPZB8POswTxSAL1cb3ZC3GVKwtm4CSz0NDiNdZBsNk5vu7N40WU');
    }

    /**
     * Send order confirmation via WhatsApp
     */
    public function sendOrderConfirmationTemplate($order)
    {
        if (!env('WHATSAPP_ENABLED', true)) {
            Log::info('WhatsApp is disabled in configuration');
            return false;
        }

        try {
            // Get client phone number from order
            $clientPhone = $this->formatPhoneNumber($order->phone);
            
            if (!$clientPhone) {
                Log::warning('WhatsApp notification skipped - invalid phone number', [
                    'order_id' => $order->id,
                    'original_phone' => $order->phone
                ]);
                return false;
            }

            // Format order details
            $clientName = trim($order->client_name . ' ' . $order->client_lastname);
            $orderDetails = $this->formatOrderDetailsForMessage($order);

            // Create the complete message
            $message = "🛒 *Order Confirmation*\n\n";
            $message .= "Hello *{$clientName}*!\n\n";
            $message .= "Your order has been received:\n\n";
            $message .= $orderDetails;
            $message .= "\n\nPlease reply with:\n";
            $message .= "✅ Type *CONFIRM* to confirm your order\n";
            $message .= "❌ Type *CANCEL* to cancel your order\n\n";
            $message .= "Thank you for shopping with us! 🛍️";

            // Send WhatsApp message
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->accessToken,
                'Content-Type' => 'application/json'
            ])->post($this->endpoint, [
                'messaging_product' => 'whatsapp',
                'to' => $clientPhone,
                'type' => 'text',
                'text' => [
                    'body' => $message
                ]
            ]);

            if ($response->successful()) {
                Log::info('WhatsApp order confirmation sent successfully', [
                    'order_id' => $order->id,
                    'phone' => $clientPhone,
                    'message_id' => $response->json('messages.0.id') ?? 'unknown'
                ]);
                return true;
            } else {
                $errorData = $response->json();
                Log::error('WhatsApp message API error', [
                    'order_id' => $order->id,
                    'phone' => $clientPhone,
                    'status' => $response->status(),
                    'response' => $errorData
                ]);
                return false;
            }

        } catch (\Exception $e) {
            Log::error('WhatsApp service exception', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Format phone number for WhatsApp (ensure it has country code)
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
     * Format order details for WhatsApp message
     */
    private function formatOrderDetailsForMessage($order)
    {
        $details = "📋 *Order Details:*\n";
        $details .= "• Order #" . $order->id . "\n";
        
        if ($order->products_id && $order->product) {
            $details .= "• Product: " . $order->product->name . "\n";
            $details .= "• Quantity: " . ($order->quantity ?? 1) . "\n";
            $details .= "• Price: " . number_format($order->product->current_price ?? $order->product->price ?? 0, 2) . " DH\n";
        }
        
        $details .= "• Status: " . ucfirst($order->status ?? 'pending') . "\n";
        $details .= "• Payment: " . ($order->method_payment ?? 'Not specified');
        
        return $details;
    }

    /**
     * Send custom WhatsApp message
     */
    public function sendCustomMessage($phone, $message)
    {
        try {
            $formattedPhone = $this->formatPhoneNumber($phone);
            
            if (!$formattedPhone) {
                return ['success' => false, 'error' => 'Invalid phone number'];
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->accessToken,
                'Content-Type' => 'application/json'
            ])->post($this->endpoint, [
                'messaging_product' => 'whatsapp',
                'to' => $formattedPhone,
                'type' => 'text',
                'text' => [
                    'body' => $message
                ]
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'message_id' => $response->json('messages.0.id') ?? null,
                    'phone' => $formattedPhone
                ];
            } else {
                return [
                    'success' => false,
                    'error' => $response->json(),
                    'status' => $response->status()
                ];
            }

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Handle WhatsApp webhook for message responses
     */
    public function handleWebhook($payload)
    {
        try {
            Log::info('WhatsApp webhook received', ['payload' => $payload]);
            
            if (!isset($payload['entry'][0]['changes'][0]['value']['messages'][0])) {
                return false;
            }

            $message = $payload['entry'][0]['changes'][0]['value']['messages'][0];
            $messageText = strtoupper(trim($message['text']['body'] ?? ''));
            $senderPhone = $message['from'] ?? '';
            
            if (strpos($messageText, 'CONFIRM') !== false) {
                return $this->handleOrderConfirmation($senderPhone);
            } elseif (strpos($messageText, 'CANCEL') !== false) {
                return $this->handleOrderCancellation($senderPhone);
            }
            
            return false;
        } catch (\Exception $e) {
            Log::error('WhatsApp webhook error', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Handle order confirmation via WhatsApp
     */
    private function handleOrderConfirmation($senderPhone)
    {
        try {
            $order = Order::where('phone', 'LIKE', '%' . substr($senderPhone, -9))
                          ->where('status', 'new')
                          ->orderBy('created_at', 'desc')
                          ->first();
            
            if (!$order) {
                return false;
            }
            
            $order->status = 'processing';
            $order->save();
            
            Log::info('Order confirmed via WhatsApp', [
                'order_id' => $order->id,
                'phone' => $senderPhone
            ]);
            
            $this->sendStatusUpdateConfirmation($order, 'confirmed');
            return true;
        } catch (\Exception $e) {
            Log::error('Error handling order confirmation', [
                'phone' => $senderPhone,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Handle order cancellation via WhatsApp
     */
    private function handleOrderCancellation($senderPhone)
    {
        try {
            $order = Order::where('phone', 'LIKE', '%' . substr($senderPhone, -9))
                          ->where('status', 'new')
                          ->orderBy('created_at', 'desc')
                          ->first();
            
            if (!$order) {
                return false;
            }
            
            $order->status = 'cancelled';
            $order->save();
            
            Log::info('Order cancelled via WhatsApp', [
                'order_id' => $order->id,
                'phone' => $senderPhone
            ]);
            
            $this->sendStatusUpdateConfirmation($order, 'cancelled');
            return true;
        } catch (\Exception $e) {
            Log::error('Error handling order cancellation', [
                'phone' => $senderPhone,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Send status update confirmation to client
     */
    private function sendStatusUpdateConfirmation(Order $order, $status)
    {
        try {
            $phoneNumber = $this->formatPhoneNumber($order->phone);
            
            if ($status === 'confirmed') {
                $message = "✅ *Order Confirmed!*\n\n";
                $message .= "Thank you! Your order #" . $order->id . " has been confirmed and is now being processed.\n\n";
                $message .= "We will contact you soon for delivery details. 📦";
            } else {
                $message = "❌ *Order Cancelled*\n\n";
                $message .= "Your order #" . $order->id . " has been cancelled as requested.\n\n";
                $message .= "Thank you for your time. Feel free to place a new order anytime! 🛍️";
            }

            Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->accessToken,
                'Content-Type' => 'application/json',
            ])->post($this->endpoint, [
                'messaging_product' => 'whatsapp',
                'to' => $phoneNumber,
                'type' => 'text',
                'text' => [
                    'body' => $message
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error sending status confirmation', ['error' => $e->getMessage()]);
        }
    }
}
