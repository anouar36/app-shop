<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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
     * Send WhatsApp order confirmation message to client
     */
    public function sendOrderConfirmation($order)
    {
        // Check if WhatsApp is enabled
        if (!env('WHATSAPP_ENABLED', true)) {
            Log::info('WhatsApp notifications are disabled', ['order_id' => $order->id]);
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

            // Create confirmation message
            $message = $this->buildOrderConfirmationMessage($order);

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
                    'message_id' => $response->json()['messages'][0]['id'] ?? null
                ]);
                return true;
            } else {
                Log::error('WhatsApp API error', [
                    'order_id' => $order->id,
                    'phone' => $clientPhone,
                    'status' => $response->status(),
                    'response' => $response->json()
                ]);
                return false;
            }

        } catch (\Exception $e) {
            Log::error('WhatsApp service error', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
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

        // Validate phone number length (should be 12-15 digits with country code)
        if (strlen($phone) < 10 || strlen($phone) > 15) {
            return null;
        }

        return $phone;
    }

    /**
     * Build order confirmation message
     */
    private function buildOrderConfirmationMessage($order)
    {
        $orderNumber = '#ORD-' . str_pad($order->id, 4, '0', STR_PAD_LEFT);
        $customerName = $order->client_name . ' ' . $order->client_lastname;
        $productName = $order->product ? $order->product->name : 'Produit';
        $total = $order->product ? number_format($order->product->price, 2) . ' DH' : 'N/A';
        $paymentMethod = $order->payment_method === 'cod' ? 'Paiement à la livraison' : 'Paiement en ligne';

        $message = "🛒 *Confirmation de commande*\n\n";
        $message .= "Bonjour *{$customerName}*,\n\n";
        $message .= "Votre commande a été confirmée avec succès !\n\n";
        $message .= "📋 *Détails de la commande:*\n";
        $message .= "• N° commande: *{$orderNumber}*\n";
        $message .= "• Produit: {$productName}\n";
        $message .= "• Total: *{$total}*\n";
        $message .= "• Mode de paiement: {$paymentMethod}\n\n";
        
        if ($order->payment_method === 'cod') {
            $message .= "💰 Vous paierez à la livraison.\n\n";
        } else {
            $message .= "✅ Votre paiement a été traité avec succès.\n\n";
        }

        $message .= "📞 Pour toute question, contactez-nous.\n\n";
        $message .= "Merci pour votre confiance ! 🙏";

        return $message;
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
                    'message_id' => $response->json()['messages'][0]['id'] ?? null,
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
}
