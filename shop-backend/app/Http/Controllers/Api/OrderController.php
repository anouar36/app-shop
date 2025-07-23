<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\AdminNotification;
use App\Mail\OrderNotification;
use App\Mail\EnhancedOrderNotification;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    /**
     * Display a listing of orders with optional status filtering
     */
    public function index(Request $request)
    {
        try {
            $query = Order::with(['client', 'product']);

            // Apply status filter if provided
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Apply search filter if provided
            if ($request->has('search') && !empty($request->search)) {
                $searchTerm = $request->search;
                $query->where(function($q) use ($searchTerm) {
                    $q->where('client_name', 'like', "%{$searchTerm}%")
                      ->orWhere('client_lastname', 'like', "%{$searchTerm}%")
                      ->orWhere('email', 'like', "%{$searchTerm}%")
                      ->orWhere('phone', 'like', "%{$searchTerm}%");
                });
            }
            
            // Apply product filter if provided
            if ($request->has('product') && !empty($request->product)) {
                $productTerm = $request->product;
                $query->whereHas('product', function($q) use ($productTerm) {
                    $q->where('name', 'like', "%{$productTerm}%");
                });
            }
            
            // Apply date filter if provided (for invoice generation)
            if ($request->has('date') && !empty($request->date)) {
                $date = $request->date;
                $query->whereDate('date_creation', $date);
            }

            // Apply sorting with validation
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            
            // Validate sort field exists to prevent SQL errors
            $validSortFields = ['id', 'created_at', 'date_creation', 'date_arrival', 'status'];
            $sortBy = in_array($sortBy, $validSortFields) ? $sortBy : 'created_at';
            
            // Validate sort order to prevent SQL errors
            $sortOrder = in_array(strtolower($sortOrder), ['asc', 'desc']) ? $sortOrder : 'desc';
            
            try {
                $query->orderBy($sortBy, $sortOrder);
            } catch (\Exception $e) {
                \Log::error('Order sorting error: ' . $e->getMessage());
                // Fallback to ID sorting if the requested sort fails
                $query->orderBy('id', 'desc');
            }

            // Paginate results
            $perPage = $request->get('per_page', 15);
            $orders = $query->paginate($perPage);

            // Transform data for frontend
            $transformedOrders = $orders->getCollection()->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => '#ORD-' . str_pad($order->id, 4, '0', STR_PAD_LEFT),
                    'customer' => $order->client ? $order->client->name . ' ' . $order->client->last_name : $order->client_name . ' ' . $order->client_lastname,
                    'customer_email' => $order->email,
                    'customer_phone' => $order->client ? $order->client->phone : $order->phone,
                    'product_name' => $order->product ? $order->product->name : 'Product not found',
                    'total' => $order->product ? '$' . number_format($order->product->price, 2) : '$0.00',
                    'payment_method' => $order->method_payment,
                    'status' => $order->status,
                    'date_creation' => $order->date_creation ? $order->date_creation->format('M d, Y H:i') : $order->created_at->format('M d, Y H:i'),
                    'date_arrival' => $order->date_arrival ? $order->date_arrival->format('M d, Y') : null,
                    'created_at' => $order->created_at->format('M d, Y H:i'),
                    'updated_at' => $order->updated_at->format('M d, Y H:i')
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $transformedOrders,
                'pagination' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'per_page' => $orders->perPage(),
                    'total' => $orders->total(),
                    'from' => $orders->firstItem(),
                    'to' => $orders->lastItem()
                ],
                'filters' => [
                    'status' => $request->get('status', 'all'),
                    'search' => $request->get('search', ''),
                    'sort_by' => $sortBy,
                    'sort_order' => $sortOrder
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order statistics grouped by status
     */
    public function statistics()
    {
        try {
            $stats = [
                'total' => Order::count(),
                'new' => Order::where('status', 'new')->count(),
                'processing' => Order::where('status', 'processing')->count(),
                'route' => Order::where('status', 'route')->count(),
                'changed' => Order::where('status', 'changed')->count(),
                'completed' => Order::where('status', 'completed')->count(),
                'cancelled' => Order::where('status', 'cancelled')->count(),
            ];

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch order statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created order with payment handling
     * Supports both authenticated users and guest checkout
     */
    public function store(Request $request)
    {
        try {
            // Debug: Log the raw request data
            \Log::info('Order creation request received:', [
                'method' => $request->method(),
                'content_type' => $request->header('Content-Type'),
                'raw_input' => $request->getContent(),
                'all_data' => $request->all(),
                'json_data' => $request->json() ? $request->json()->all() : null,
                'has_json' => $request->isJson(),
                'input_products_id' => $request->input('products_id'),
                'input_client_name' => $request->input('client_name')
            ]);
            
            // Check if we're receiving any data at all
            if (empty($request->all())) {
                // Try to parse JSON manually if Content-Type is wrong
                $rawContent = $request->getContent();
                if (!empty($rawContent)) {
                    $jsonData = json_decode($rawContent, true);
                    if (json_last_error() === JSON_ERROR_NONE && !empty($jsonData)) {
                        // JSON is valid, merge it into the request
                        $request->merge($jsonData);
                        \Log::info('Fixed JSON parsing - Content-Type was wrong but JSON is valid');
                    } else {
                        return response()->json([
                            'success' => false,
                            'message' => 'Invalid JSON received',
                            'debug' => [
                                'content_type' => $request->header('Content-Type'),
                                'raw_content' => $rawContent,
                                'json_error' => json_last_error_msg()
                            ]
                        ], 400);
                    }
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'No data received',
                        'debug' => [
                            'content_type' => $request->header('Content-Type'),
                            'raw_content' => $rawContent,
                            'is_json' => $request->isJson()
                        ]
                    ], 400);
                }
            }
            
            // Check if user is authenticated (optional) - handle gracefully if no DB connection
            $user = null;
            try {
                $user = $request->user();
            } catch (\Exception $e) {
                // If authentication fails (e.g., DB connection issue), treat as guest
                \Log::warning('Authentication check failed, treating as guest user', ['error' => $e->getMessage()]);
                $user = null;
            }
            
            // Normalize payment method field - accept both method_payment and payment_method
            $requestData = $request->all();
            
            // Handle payment method normalization - ensure both fields are set
            if (isset($requestData['method_payment']) && !isset($requestData['payment_method'])) {
                // Convert method_payment to payment_method format
                if ($requestData['method_payment'] === 'cash_on_delivery') {
                    $requestData['payment_method'] = 'cod';
                } elseif ($requestData['method_payment'] === 'bank_transfer') {
                    $requestData['payment_method'] = 'online';
                } else {
                    // Default mapping for other values
                    $requestData['payment_method'] = 'cod';
                }
            } elseif (isset($requestData['payment_method']) && !isset($requestData['method_payment'])) {
                // Convert payment_method to method_payment format for database storage
                if ($requestData['payment_method'] === 'cod') {
                    $requestData['method_payment'] = 'Cash on Delivery';
                } elseif ($requestData['payment_method'] === 'online') {
                    $requestData['method_payment'] = 'Online Payment';
                } else {
                    $requestData['method_payment'] = 'Cash on Delivery';
                }
            }
            
            // Ensure both fields exist with default values if neither is provided
            if (!isset($requestData['payment_method']) && !isset($requestData['method_payment'])) {
                $requestData['payment_method'] = 'cod';
                $requestData['method_payment'] = 'Cash on Delivery';
            }
            
            // Merge the normalized data back into the request
            $request->merge($requestData);
            
            // Simplify validation for debugging - check one field at a time
            $rules = [
                'products_id' => 'required|integer|min:1',
                'client_name' => 'required|string|max:255',
                'client_lastname' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
                'method_payment' => 'required|string|max:255',
                'payment_method' => 'required|in:cod,online'
            ];
            
            // Check each field individually for better debugging
            $errors = [];
            foreach ($rules as $field => $rule) {
                $value = $request->input($field);
                if (empty($value) && $field !== 'products_id') {
                    $errors[$field] = "Field {$field} is missing or empty. Received: " . json_encode($value);
                } elseif ($field === 'products_id' && (!is_numeric($value) || $value < 1)) {
                    $errors[$field] = "Field {$field} must be a positive integer. Received: " . json_encode($value);
                } elseif ($field === 'payment_method' && !in_array($value, ['cod', 'online'])) {
                    $errors[$field] = "Field {$field} must be 'cod' or 'online'. Received: " . json_encode($value);
                }
            }
            
            if (!empty($errors)) {
                \Log::error('Order validation failed with custom check:', $errors);
                return response()->json([
                    'success' => false,
                    'message' => 'Custom validation failed',
                    'errors' => $errors,
                    'received_data' => $request->all()
                ], 422);
            }
            
            // If we get here, try the normal validation
            $validated = $request->validate([
                'client_id' => 'nullable|exists:users,id',
                'products_id' => 'required|integer|min:1',  // Temporarily removed exists:products,id
                'client_name' => 'required|string|max:255',
                'client_lastname' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
                'method_payment' => 'required|string|max:255',  // Original database field
                'payment_method' => 'required|in:cod,online',   // API logic field
                'payment_status' => 'sometimes|in:pending,paid,failed',
                'payment_code' => 'nullable|string',
                'payment_details' => 'nullable|array',
                'date_arrival' => 'nullable|date',
                'status' => 'nullable|string|in:new,processing,route,changed,completed,cancelled'
            ]);

            // Set default values
            $validated['date_creation'] = now();
            $validated['status'] = $validated['status'] ?? 'new';

            // If user is authenticated, associate order with their account
            if ($user) {
                $validated['client_id'] = $user->id;
                // Optionally override guest info with user info
                // $validated['client_name'] = $user->name;
                // $validated['client_lastname'] = $user->last_name;
                // $validated['email'] = $user->email;
            } else {
                // Guest checkout - client_id remains null
                $validated['client_id'] = null;
            }

            // Handle payment logic
            if ($validated['payment_method'] === 'cod') {
                // Cash on Delivery - set pending status
                $validated['payment_status'] = 'pending';
                $validated['status'] = 'new'; // Order status for COD
            } else {
                // Online payment
                $paymentResult = $this->processOnlinePayment($validated);
                
                if ($paymentResult['success']) {
                    $validated['payment_status'] = 'paid';
                    $validated['payment_code'] = $paymentResult['payment_code'];
                    $validated['payment_date'] = now();
                    $validated['payment_details'] = $paymentResult['details'];
                    $validated['status'] = 'processing'; // Order can proceed to processing
                } else {
                    // Payment failed - don't create order or mark as failed
                    return response()->json([
                        'success' => false,
                        'message' => 'Payment failed',
                        'error' => $paymentResult['message']
                    ], 400);
                }
            }

            $order = Order::create($validated);
            $order->load(['client', 'product']);

            // Create dashboard notification first
            $notification = AdminNotification::createOrderNotification($order, 'order_created');

            // Send enhanced email notification to admin(s)
            try {
                // Get admin emails from database dynamically
                $adminEmails = User::getAdminEmails();
                
                if (empty($adminEmails)) {
                    // Fallback to hardcoded admin email
                    $adminEmails = ['anouarechcharai@gmail.com'];
                    \Log::warning('No admin users found in database, using fallback email', ['fallback_email' => $adminEmails[0]]);
                }

                // Send enhanced email to all admin users
                foreach ($adminEmails as $adminEmail) {
                    Mail::to($adminEmail)->send(new EnhancedOrderNotification($order, $notification));
                }

                \Log::info('Enhanced order notification emails sent to admins', [
                    'order_id' => $order->id, 
                    'notification_id' => $notification->id,
                    'admin_emails' => $adminEmails,
                    'total_emails_sent' => count($adminEmails)
                ]);
            } catch (\Exception $emailError) {
                // Log email error but don't fail the order creation
                \Log::error('Failed to send enhanced order notification email', [
                    'order_id' => $order->id,
                    'notification_id' => $notification->id,
                    'error' => $emailError->getMessage()
                ]);
            }

            // Send WhatsApp confirmation to client
            try {
                $whatsappSent = $this->sendWhatsAppOrderConfirmation($order);
                
                if ($whatsappSent) {
                    \Log::info('WhatsApp order confirmation sent to client', [
                        'order_id' => $order->id,
                        'client_phone' => $order->phone,
                        'message_sent' => true
                    ]);
                    
                    // Track sent WhatsApp message for REAL-TIME confirmation system
                    $autoConfirmService = new \App\Services\WhatsAppAutoConfirmService();
                    $autoConfirmService->trackSentMessage($order, 'order_confirmation');
                    
                    // Also track for real-time processing
                    $realTimeService = new \App\Services\WhatsAppRealTimeService();
                    $realTimeService->trackSentMessage($order, 'order_confirmation');
                } else {
                    \Log::warning('WhatsApp order confirmation failed', [
                        'order_id' => $order->id,
                        'client_phone' => $order->phone,
                        'message_sent' => false
                    ]);
                }
                
                if ($whatsappSent) {
                    \Log::info('WhatsApp order confirmation template sent to client', [
                        'order_id' => $order->id,
                        'client_phone' => $order->phone,
                        'client_name' => $order->client_name . ' ' . $order->client_lastname
                    ]);
                }
            } catch (\Exception $whatsappError) {
                // Log WhatsApp error but don't fail the order creation
                \Log::error('Failed to send WhatsApp order confirmation template', [
                    'order_id' => $order->id,
                    'client_phone' => $order->phone,
                    'error' => $whatsappError->getMessage()
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => '#ORD-' . str_pad($order->id, 4, '0', STR_PAD_LEFT),
                    'status' => $order->status,
                    'payment_method' => $order->payment_method,
                    'payment_status' => $order->payment_status,
                    'payment_code' => $order->payment_code,
                    'total' => $order->product ? '$' . number_format($order->product->price, 2) : '$0.00',
                    'customer_type' => $user ? 'authenticated' : 'guest',
                    'customer_id' => $user ? $user->id : null,
                    'order' => $order
                ]
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process online payment (simulated)
     * In a real application, this would integrate with PayPal, Stripe, etc.
     */
    private function processOnlinePayment($orderData)
    {
        // Simulate payment processing
        $paymentSuccess = $orderData['payment_status'] ?? 'paid'; // Allow testing with different statuses
        
        if ($paymentSuccess === 'failed') {
            return [
                'success' => false,
                'message' => 'Payment was declined by the payment processor'
            ];
        }

        // Simulate successful payment with unique code
        $paymentCode = 'PAY-' . strtoupper(uniqid()) . '-' . time();
        
        return [
            'success' => true,
            'payment_code' => $paymentCode,
            'details' => [
                'processor' => 'PayPal', // or 'Stripe', 'Bank', etc.
                'transaction_id' => $paymentCode,
                'amount' => 100.00, // This would come from product price
                'currency' => 'USD',
                'processed_at' => now()->toISOString(),
                'gateway_response' => 'APPROVED'
            ]
        ];
    }

    /**
     * Update payment status for an order
     */
    public function updatePaymentStatus(Request $request, Order $order)
    {
        try {
            $validated = $request->validate([
                'payment_status' => 'required|in:pending,paid,failed,refunded',
                'payment_code' => 'nullable|string',
                'payment_details' => 'nullable|array'
            ]);

            $updateData = [
                'payment_status' => $validated['payment_status']
            ];

            if ($validated['payment_status'] === 'paid') {
                $updateData['payment_date'] = now();
                if (isset($validated['payment_code'])) {
                    $updateData['payment_code'] = $validated['payment_code'];
                }
                if (isset($validated['payment_details'])) {
                    $updateData['payment_details'] = $validated['payment_details'];
                }
            }

            $order->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Payment status updated successfully',
                'data' => [
                    'order_id' => $order->id,
                    'payment_status' => $order->payment_status,
                    'payment_code' => $order->payment_code,
                    'payment_date' => $order->payment_date
                ]
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update payment status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified order
     */
    public function show(Order $order)
    {
        try {
            $order->load(['client', 'product']);
            
            return response()->json([
                'success' => true,
                'data' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified order
     */
    public function update(Request $request, Order $order)
    {
        try {
            $validated = $request->validate([
                'client_id' => 'nullable|exists:users,id',
                'products_id' => 'sometimes|exists:products,id',
                'client_name' => 'sometimes|string|max:255',
                'client_lastname' => 'sometimes|string|max:255',
                'email' => 'sometimes|email|max:255',
                'phone' => 'sometimes|string|max:20',
                'method_payment' => 'sometimes|string|max:50',
                'date_arrival' => 'nullable|date',
                'status' => 'sometimes|string|in:new,processing,route,changed,completed,cancelled'
            ]);

            $order->update($validated);
            $order->load(['client', 'product']);

            return response()->json([
                'success' => true,
                'message' => 'Order updated successfully',
                'data' => $order
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update only the status of an order
     */
    public function updateStatus(Request $request, Order $order)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|string|in:new,processing,route,changed,completed,cancelled'
            ]);

            $order->update(['status' => $validated['status']]);

            return response()->json([
                'success' => true,
                'message' => 'Order status updated successfully',
                'data' => [
                    'id' => $order->id,
                    'status' => $order->status
                ]
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update customer information for an order
     */
    public function updateCustomerInfo(Request $request, Order $order)
    {
        try {
            $validated = $request->validate([
                'client_name' => 'required|string|max:255',
                'client_lastname' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
            ]);

            $oldData = [
                'client_name' => $order->client_name,
                'client_lastname' => $order->client_lastname,
                'email' => $order->email,
                'phone' => $order->phone,
            ];

            $order->update($validated);

            // Create notification for customer info update
            $notification = AdminNotification::createOrderNotification($order, 'order_updated');

            return response()->json([
                'success' => true,
                'message' => 'Customer information updated successfully',
                'data' => [
                    'order_id' => $order->id,
                    'old_data' => $oldData,
                    'new_data' => $validated,
                    'notification_id' => $notification->id
                ]
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update customer information',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update delivery information for an order
     */
    public function updateDeliveryInfo(Request $request, Order $order)
    {
        try {
            $validated = $request->validate([
                'date_arrival' => 'required|date|after:today',
                'delivery_address' => 'nullable|string|max:500',
                'delivery_notes' => 'nullable|string|max:1000',
            ]);

            $oldData = [
                'date_arrival' => $order->date_arrival,
            ];

            $order->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Delivery information updated successfully',
                'data' => [
                    'order_id' => $order->id,
                    'old_data' => $oldData,
                    'new_data' => $validated
                ]
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update delivery information',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update product/content for an order
     */
    public function updateOrderProduct(Request $request, Order $order)
    {
        try {
            $validated = $request->validate([
                'products_id' => 'required|exists:products,id',
                'quantity' => 'nullable|integer|min:1',
                'special_instructions' => 'nullable|string|max:1000',
            ]);

            $oldProductId = $order->products_id;
            $oldProduct = $order->product;

            $order->update(['products_id' => $validated['products_id']]);
            $order->load('product');

            return response()->json([
                'success' => true,
                'message' => 'Order product updated successfully',
                'data' => [
                    'order_id' => $order->id,
                    'old_product' => $oldProduct ? $oldProduct->name : 'Unknown',
                    'new_product' => $order->product->name,
                    'new_total' => '$' . number_format($order->product->price, 2)
                ]
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order product',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update order notes/comments
     */
    public function updateOrderNotes(Request $request, Order $order)
    {
        try {
            $validated = $request->validate([
                'admin_notes' => 'nullable|string|max:2000',
                'customer_notes' => 'nullable|string|max:1000',
            ]);

            // Add notes to order (you might need to add these fields to the orders table)
            $order->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Order notes updated successfully',
                'data' => $validated
            ]);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update order notes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order edit history (if you implement order history tracking)
     */
    public function getOrderHistory(Order $order)
    {
        try {
            // This would require implementing an order_history table
            // For now, return basic information
            return response()->json([
                'success' => true,
                'data' => [
                    'order_id' => $order->id,
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at,
                    'current_status' => $order->status,
                    'payment_status' => $order->payment_status ?? 'pending'
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch order history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified order
     */
    public function destroy(Order $order)
    {
        try {
            $order->delete();

            return response()->json([
                'success' => true,
                'message' => 'Order deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get admin notifications
     */
    public function getNotifications(Request $request)
    {
        try {
            $query = AdminNotification::latest();

            // Filter by read status if specified
            if ($request->has('status')) {
                if ($request->status === 'unread') {
                    $query->unread();
                } elseif ($request->status === 'read') {
                    $query->read();
                }
            }

            // Filter by type if specified
            if ($request->has('type') && !empty($request->type)) {
                $query->ofType($request->type);
            }

            $perPage = $request->get('per_page', 15);
            $notifications = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $notifications->items(),
                'pagination' => [
                    'current_page' => $notifications->currentPage(),
                    'last_page' => $notifications->lastPage(),
                    'per_page' => $notifications->perPage(),
                    'total' => $notifications->total(),
                    'from' => $notifications->firstItem(),
                    'to' => $notifications->lastItem()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch notifications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get unread notifications count
     */
    public function getUnreadCount()
    {
        try {
            $count = AdminNotification::getUnreadCount();

            return response()->json([
                'success' => true,
                'unread_count' => $count
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get unread count',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark a notification as read
     */
    public function markNotificationAsRead($notificationId)
    {
        try {
            $notification = AdminNotification::findOrFail($notificationId);
            $notification->markAsRead();

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark notification as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllNotificationsAsRead()
    {
        try {
            AdminNotification::markAllAsRead();

            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark all notifications as read',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a notification
     */
    public function deleteNotification($notificationId)
    {
        try {
            $notification = AdminNotification::findOrFail($notificationId);
            $notification->delete();

            return response()->json([
                'success' => true,
                'message' => 'Notification deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send WhatsApp order confirmation directly
     */
    private function sendWhatsAppOrderConfirmation($order)
    {
        if (!env('WHATSAPP_ENABLED', true)) {
            \Log::info('WhatsApp is disabled in configuration');
            return false;
        }

        try {
            // Format phone number for WhatsApp
            $clientPhone = $this->formatPhoneNumber($order->phone);
            
            if (!$clientPhone) {
                \Log::warning('WhatsApp notification skipped - invalid phone number', [
                    'order_id' => $order->id,
                    'original_phone' => $order->phone
                ]);
                return false;
            }

            // Create the WhatsApp message
            $clientName = trim($order->client_name . ' ' . $order->client_lastname);
            $message = "🛒 *Order Confirmation*\n\n";
            $message .= "Hello *{$clientName}*!\n\n";
            $message .= "Your order has been received:\n\n";
            $message .= "📋 *Order Details:*\n";
            $message .= "• Order #" . $order->id . "\n";
            
            if ($order->products_id && $order->product) {
                $message .= "• Product: " . $order->product->name . "\n";
                $message .= "• Quantity: " . ($order->quantity ?? 1) . "\n";
                $message .= "• Price: " . number_format($order->product->current_price ?? $order->product->price ?? 0, 2) . " DH\n";
            }
            
            $message .= "• Status: " . ucfirst($order->status ?? 'pending') . "\n";
            $message .= "• Payment: " . ($order->method_payment ?? 'Not specified') . "\n\n";
            $message .= "Please reply with:\n";
            $message .= "✅ Type *CONFIRM* to confirm your order\n";
            $message .= "❌ Type *CANCEL* to cancel your order\n\n";
            $message .= "Thank you for shopping with us! 🛍️";

            // Send WhatsApp message using Laravel HTTP client
            $endpoint = env('WHATSAPP_ENDPOINT', 'https://graph.facebook.com/v19.0/751903787999076/messages');
            $accessToken = env('WHATSAPP_ACCESS_TOKEN', 'EAAI67Ip2YMcBPPatSMMXRZCbcaCWGB6hyyJKRBZBOYFSZB3qsmidKX8xt1JixjojxB34OxkjERLXphrGxcWLEXdZB7VpIx4OZBag2kk7dSZBLE7ept7NntgMXQqiBYsY1wrIZB1QPpuQFaQWOCZCzPZB8POswTxSAL1cb3ZC3GVKwtm4CSz0NDiNdZBsNk5vu7N40WU');

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type' => 'application/json'
            ])->post($endpoint, [
                'messaging_product' => 'whatsapp',
                'to' => $clientPhone,
                'type' => 'text',
                'text' => [
                    'body' => $message
                ]
            ]);

            if ($response->successful()) {
                \Log::info('WhatsApp order confirmation sent successfully', [
                    'order_id' => $order->id,
                    'phone' => $clientPhone,
                    'message_id' => $response->json('messages.0.id') ?? 'unknown'
                ]);
                return true;
            } else {
                $errorData = $response->json();
                \Log::error('WhatsApp message API error', [
                    'order_id' => $order->id,
                    'phone' => $clientPhone,
                    'status' => $response->status(),
                    'response' => $errorData
                ]);
                return false;
            }

        } catch (\Exception $e) {
            \Log::error('WhatsApp service exception', [
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

        // Validate phone number length (should be 12-15 digits with country code)
        if (strlen($phone) < 10 || strlen($phone) > 15) {
            return null;
        }

        return $phone;
    }
}
