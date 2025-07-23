<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;   
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\WhatsAppController;

// Test route
Route::get('/test', function () {                                                                                                                                        
    return response()->json(['message' => 'API is working!']);
});

// Test email configuration
Route::post('/test-email', function () {
    try {
        $adminEmail = env('MAIL_ADMIN_EMAIL', 'anouarechcharai@gmail.com');
        
        // Create a test order for email
        $testOrder = new \App\Models\Order();
        $testOrder->id = 999;
        $testOrder->client_name = 'Email Test';
        $testOrder->client_lastname = 'Customer';
        $testOrder->email = 'test@example.com';
        $testOrder->phone = '+1234567890';
        $testOrder->method_payment = 'Email Test';
        $testOrder->payment_method = 'cod';
        $testOrder->payment_status = 'pending';
        $testOrder->status = 'pending';
        $testOrder->created_at = now();
        
        // Create notification
        $notification = \App\Models\AdminNotification::createOrderNotification($testOrder, 'email_test');
        
        // Send email
        \Illuminate\Support\Facades\Mail::to($adminEmail)->send(new \App\Mail\EnhancedOrderNotification($testOrder, $notification));
        
        return response()->json([
            'success' => true,
            'message' => 'Test email sent successfully!',
            'admin_email' => $adminEmail,
            'notification_id' => $notification->id
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// Test simple email
Route::post('/test-simple-email', function () {
    try {
        $adminEmail = env('MAIL_ADMIN_EMAIL', 'anouarechcharai@gmail.com');
        
        \Illuminate\Support\Facades\Mail::raw('This is a test email from your Laravel application. If you receive this, your email configuration is working!', function ($message) use ($adminEmail) {
            $message->to($adminEmail)
                    ->subject('🧪 Laravel Email Test - Configuration Working!');
        });
        
        return response()->json([
            'success' => true,
            'message' => 'Simple test email sent!',
            'admin_email' => $adminEmail
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

// Test database connection
Route::get('/test-db', function () {
    try {
        $categories = \App\Models\Category::all();
        $products = \App\Models\Product::all();
        return response()->json([
            'categories_count' => $categories->count(),
            'products_count' => $products->count(),
            'sample_category' => $categories->first(),
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Test WhatsApp service
Route::post('/test-whatsapp', function (Request $request) {
    try {
        $whatsappService = new \App\Services\WhatsAppService();
        
        $phone = $request->input('phone', '212639383709'); // Default test number
        $message = $request->input('message', 'Test message from your shop system! 🛒');
        
        $result = $whatsappService->sendCustomMessage($phone, $message);
        
        return response()->json([
            'success' => $result['success'],
            'message' => $result['success'] ? 'WhatsApp message sent successfully!' : 'Failed to send WhatsApp message',
            'data' => $result,
            'phone_used' => $phone
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

// Test WhatsApp with order confirmation format
Route::post('/test-whatsapp-order', function (Request $request) {
    try {
        $whatsappService = new \App\Services\WhatsAppService();
        
        // Get order ID from request or use a test order
        $orderId = $request->input('order_id');
        
        if ($orderId) {
            $order = \App\Models\Order::with('product')->find($orderId);
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'error' => 'Order not found'
                ], 404);
            }
        } else {
            // Create a fake order for testing
            $order = new \App\Models\Order();
            $order->id = 999;
            $order->client_name = 'Test';
            $order->client_lastname = 'Customer';
            $order->email = 'test@example.com';
            $order->phone = $request->input('phone', '212639383709');
            $order->delivery_address = '123 Test Street, Test City, Morocco';
            $order->payment_method = 'cod';
            $order->status = 'pending';
            $order->total_price = 299.99;
            
            // Create fake product
            $product = new \App\Models\Product();
            $product->name = 'Test Product';
            $product->price = 299.99;
            $order->setRelation('product', $product);
        }
        
        $result = $whatsappService->sendOrderConfirmationTemplate($order);
        
        return response()->json([
            'success' => $result,
            'message' => $result ? 'WhatsApp order confirmation sent!' : 'Failed to send WhatsApp confirmation',
            'order_phone' => $order->phone,
            'order_name' => $order->client_name . ' ' . $order->client_lastname
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

// Test product creation route
Route::post('/test-product', function (Request $request) {
    try {
        \Log::info('Test product request received', $request->all());
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'description' => 'required|string',
            'current_price' => 'required|numeric|min:0',
            'size' => 'nullable|string',
        ]);
        
        $product = \App\Models\Product::create($validated);
        return response()->json(['success' => true, 'product' => $product], 201);
        
    } catch (\Exception $e) {
        \Log::error('Test product creation error: ' . $e->getMessage());
        return response()->json(['error' => $e->getMessage(), 'trace' => $e->getTraceAsString()], 500);
    }
});

// Authentication routes
Route::post('/admin/login', [AuthController::class, 'adminLogin']);
Route::post('/client/login', [AuthController::class, 'clientLogin']);
Route::post('/register', [AuthController::class, 'register']);

// Public API routes
Route::get('products', function () {
    try {
        $products = \App\Models\Product::with('category')->get();
        return response()->json($products);
    } catch (\Exception $e) {
        \Log::error('Products index error: ' . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
});
Route::get('products/{product}', [ProductController::class, 'show']);
Route::post('products', [ProductController::class, 'store']);
Route::apiResource('categories', CategoryController::class);

// Public order creation - allows both guest and authenticated users
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{order}', [OrderController::class, 'show'])->middleware('auth:sanctum');

// Protected API routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Authenticated user can view their orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::put('/orders/{order}', [OrderController::class, 'update']);
    Route::delete('/orders/{order}', [OrderController::class, 'destroy']);
    
    // Payment-related routes
    Route::put('/orders/{order}/payment-status', [OrderController::class, 'updatePaymentStatus']);
});

// Admin-only routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/admin/dashboard', [DashboardController::class, 'index']);
    Route::get('/admin/sales-data', [DashboardController::class, 'salesData']);
    Route::get('/admin/orders', [OrderController::class, 'index']);
    Route::get('/admin/orders/statistics', [OrderController::class, 'statistics']);
    Route::put('/admin/orders/{order}/status', [OrderController::class, 'updateStatus']);
    
    // Product management routes for admin
    Route::put('/products/{product}', [ProductController::class, 'update']);
    Route::post('/products/{product}', [ProductController::class, 'update']); // Handle method spoofing
    Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    
    // Enhanced Order Update Routes
    Route::put('/admin/orders/{order}/customer-info', [OrderController::class, 'updateCustomerInfo']);
    Route::put('/admin/orders/{order}/delivery-info', [OrderController::class, 'updateDeliveryInfo']);
    Route::put('/admin/orders/{order}/product', [OrderController::class, 'updateOrderProduct']);
    Route::put('/admin/orders/{order}/notes', [OrderController::class, 'updateOrderNotes']);
    Route::get('/admin/orders/{order}/history', [OrderController::class, 'getOrderHistory']);
    
    // Admin notification routes
    Route::get('/admin/notifications', [OrderController::class, 'getNotifications']);
    Route::get('/admin/notifications/unread-count', [OrderController::class, 'getUnreadCount']);
    Route::put('/admin/notifications/{notificationId}/read', [OrderController::class, 'markNotificationAsRead']);
    Route::put('/admin/notifications/mark-all-read', [OrderController::class, 'markAllNotificationsAsRead']);
    Route::delete('/admin/notifications/{notificationId}', [OrderController::class, 'deleteNotification']);
    
    Route::prefix('admin')->group(function () {
        // User/Customer Management Routes
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::get('/roles', [UserController::class, 'getRoles']);
        
        // Customer routes (alias for users for frontend compatibility)
        Route::put('/customers/{user}', [UserController::class, 'update']);
        Route::get('/customers', [UserController::class, 'index']);
        
        Route::get('/analytics', function () {
            return response()->json([
                'recent_orders' => \App\Models\Order::latest()->take(5)->get(),
                'popular_products' => \App\Models\Product::orderBy('reviews', 'desc')->take(5)->get(),
            ]);
        });
    });
});

// Debug route to check admin user
Route::get('/debug-admin', function () {
    try {
        $user = \App\Models\User::where('email', 'admin@shop.com')->first();
        
        if (!$user) {
            return response()->json([
                'error' => 'Admin user not found',
                'all_users' => \App\Models\User::all()->map(function($u) {
                    return [
                        'id' => $u->id,
                        'email' => $u->email,
                        'name' => $u->name,
                        'id_role' => $u->id_role
                    ];
                })
            ]);
        }
        
        $roleData = null;
        try {
            $roleData = $user->role;
        } catch (Exception $e) {
            $roleData = 'Error loading role: ' . $e->getMessage();
        }
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'id_role' => $user->id_role,
                'role_data' => $roleData
            ],
            'all_roles' => \App\Models\Role::all()
        ]);
    } catch (Exception $e) {
        return response()->json([
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});

// WhatsApp Integration Routes
Route::get('/whatsapp/webhook', [WhatsAppController::class, 'verify']);
Route::post('/whatsapp/webhook', [WhatsAppController::class, 'webhook']);
Route::post('/whatsapp/test', [WhatsAppController::class, 'sendTest']);

// WhatsApp Auto-Confirmation Testing Route
Route::post('/test-whatsapp-auto-confirm', function () {
    try {
        $autoConfirmService = new \App\Services\WhatsAppAutoConfirmService();
        $processedCount = $autoConfirmService->processAutoConfirmations();
        
        return response()->json([
            'success' => true,
            'message' => 'Auto-confirmation process completed',
            'processed_count' => $processedCount,
            'timestamp' => now()->toDateTimeString()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

// WhatsApp REAL-TIME Confirmation Testing Route
Route::post('/test-whatsapp-realtime', function () {
    try {
        $realTimeService = new \App\Services\WhatsAppRealTimeService();
        $processedCount = $realTimeService->processRealTimeConfirmations();
        
        return response()->json([
            'success' => true,
            'message' => 'REAL-TIME confirmation process completed',
            'type' => 'INSTANT_PROCESSING',
            'processed_count' => $processedCount,
            'timestamp' => now()->toDateTimeString()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

// AI Agent Order Monitoring Routes
Route::post('/ai-agent/status', function () {
    try {
        $excelService = new \App\Services\OrderExcelExportService();
        $aiAgent = new \App\Services\OrderMonitoringAIAgent($excelService);
        
        $status = $aiAgent->getStatus();
        
        return response()->json([
            'success' => true,
            'ai_agent_status' => $status
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::post('/ai-agent/force-report', function () {
    try {
        $excelService = new \App\Services\OrderExcelExportService();
        $aiAgent = new \App\Services\OrderMonitoringAIAgent($excelService);
        
        $result = $aiAgent->forceSendReport();
        
        return response()->json([
            'success' => true,
            'message' => 'AI Agent force report executed',
            'result' => $result
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::post('/ai-agent/test-export', function () {
    try {
        $excelService = new \App\Services\OrderExcelExportService();
        
        // Get processing orders
        $orders = $excelService->getProcessingOrders();
        
        if ($orders->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No processing orders found to export',
                'total_orders' => \App\Models\Order::count(),
                'by_status' => \App\Models\Order::groupBy('status')->selectRaw('status, count(*) as count')->get()
            ]);
        }
        
        // Generate Excel file
        $filePath = $excelService->generateExcelFile($orders);
        $summary = $excelService->getReportSummary($orders);
        
        return response()->json([
            'success' => true,
            'message' => 'Excel file generated successfully',
            'file_path' => $filePath,
            'file_exists' => file_exists($filePath),
            'file_size' => file_exists($filePath) ? filesize($filePath) : 0,
            'orders_count' => $orders->count(),
            'summary' => $summary
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ], 500);
    }
});
