<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;   
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;

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
    
    // Admin notification routes
    Route::get('/admin/notifications', [OrderController::class, 'getNotifications']);
    Route::get('/admin/notifications/unread-count', [OrderController::class, 'getUnreadCount']);
    Route::put('/admin/notifications/{notificationId}/read', [OrderController::class, 'markNotificationAsRead']);
    Route::put('/admin/notifications/mark-all-read', [OrderController::class, 'markAllNotificationsAsRead']);
    Route::delete('/admin/notifications/{notificationId}', [OrderController::class, 'deleteNotification']);
    
    Route::prefix('admin')->group(function () {
        Route::get('/users', function () {
            // Return all users with their roles and include phone information
            return response()->json(\App\Models\User::with('role')->get());
        });
        Route::get('/analytics', function () {
            return response()->json([
                'recent_orders' => \App\Models\Order::latest()->take(5)->get(),
                'popular_products' => \App\Models\Product::orderBy('reviews', 'desc')->take(5)->get(),
            ]);
        });
    });
});
