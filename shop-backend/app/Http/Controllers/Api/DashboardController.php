<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Category;
use Illuminate\Http\Request;

class DashboardController extends Controller
{    /**
     * Get admin dashboard statistics
     */
    public function index()
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'total_products' => Product::count(),
                'total_orders' => Order::count(),
                'total_categories' => Category::count(),
                'recent_orders' => Order::with(['client', 'product'])
                    ->orderBy('created_at', 'desc')
                    ->take(5)
                    ->get()
                    ->map(function ($order) {
                        return [
                            'id' => '#ORD-' . str_pad($order->id, 4, '0', STR_PAD_LEFT),
                            'customer' => $order->client ? $order->client->name : $order->client_name,
                            'date' => $order->created_at->format('M d, Y'),
                            'status' => ucfirst($order->status),
                            'total' => '$' . number_format($order->product ? $order->product->price : 0, 2)
                        ];
                    }),
                'top_products' => Product::withCount(['orders' => function($query) {
                        $query->where('status', '!=', 'cancelled');
                    }])
                    ->orderBy('orders_count', 'desc')
                    ->take(4)
                    ->get()
                    ->map(function ($product, $index) {
                        return [
                            'id' => $product->id,
                            'name' => $product->name,
                            'sales' => $product->orders_count,
                            'revenue' => '$' . number_format($product->price * $product->orders_count, 0),
                            'growth' => '+' . rand(5, 30) . '%' // Mock growth percentage
                        ];
                    })
            ];

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get monthly sales data for charts
     */
    public function salesData()
    {
        try {
            // Generate mock sales data for the last 30 days
            $salesData = [];
            for ($i = 29; $i >= 0; $i--) {
                $date = now()->subDays($i);
                $salesData[] = [
                    'date' => $date->format('M d'),
                    'sales' => rand(50, 200),
                    'revenue' => rand(1000, 5000)
                ];
            }

            return response()->json([
                'success' => true,
                'data' => $salesData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch sales data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
