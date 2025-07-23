<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Services\WhatsAppService;
use Illuminate\Support\Facades\Log;

class WhatsAppController extends Controller
{
    protected $whatsappService;

    public function __construct(WhatsAppService $whatsappService)
    {
        $this->whatsappService = $whatsappService;
    }

    /**
     * Handle WhatsApp webhook verification (GET request)
     */
    public function verify(Request $request)
    {
        $verifyToken = env('WHATSAPP_VERIFY_TOKEN', 'your_verify_token_here');
        
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        if ($mode === 'subscribe' && $token === $verifyToken) {
            Log::info('WhatsApp webhook verified successfully');
            return response($challenge, 200);
        }

        Log::warning('WhatsApp webhook verification failed', [
            'mode' => $mode,
            'token' => $token,
            'expected_token' => $verifyToken
        ]);

        return response('Verification failed', 403);
    }

    /**
     * Handle WhatsApp webhook notifications (POST request)
     */
    public function webhook(Request $request)
    {
        try {
            $payload = $request->all();
            
            Log::info('WhatsApp webhook received', [
                'payload' => $payload,
                'headers' => $request->headers->all()
            ]);

            // Process the webhook
            $result = $this->whatsappService->handleWebhook($payload);

            if ($result) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Webhook processed successfully'
                ], 200);
            } else {
                return response()->json([
                    'status' => 'ignored',
                    'message' => 'Webhook ignored - no action needed'
                ], 200);
            }

        } catch (\Exception $e) {
            Log::error('WhatsApp webhook processing error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all()
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Webhook processing failed'
            ], 500);
        }
    }

    /**
     * Send test WhatsApp message
     */
    public function sendTest(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'message' => 'required|string'
        ]);

        $result = $this->whatsappService->sendCustomMessage(
            $request->phone,
            $request->message
        );

        if ($result['success']) {
            return response()->json([
                'status' => 'success',
                'message' => 'Test message sent successfully',
                'data' => $result
            ]);
        } else {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to send test message',
                'error' => $result['error']
            ], 400);
        }
    }
}
