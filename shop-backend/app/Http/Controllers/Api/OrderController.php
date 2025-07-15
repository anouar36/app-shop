<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Models\AdminNotification;
use App\Mail\OrderNotification;
use App\Mail\EnhancedOrderNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
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
            
            // Check if user is authenticated (optional)
            $user = $request->user();
            
            // Simplify validation for debugging - check one field at a time
            $rules = [
                'products_id' => 'required|integer|min:1',
                'client_name' => 'required|string|max:255',
                'client_lastname' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'phone' => 'required|string|max:20',
                'method_payment' => 'required|string|max:50',
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
                'method_payment' => 'required|string|max:50',
                'payment_method' => 'required|in:cod,online',
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
}
