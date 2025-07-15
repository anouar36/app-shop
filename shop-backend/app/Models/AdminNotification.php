<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class AdminNotification extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'title',
        'message',
        'data',
        'is_read',
        'read_at',
        'related_id',
        'related_type',
        'action_url',
        'priority'
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Scope for unread notifications
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope for read notifications
     */
    public function scopeRead($query)
    {
        return $query->where('is_read', true);
    }

    /**
     * Scope for specific notification type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for specific priority
     */
    public function scopeWithPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now()
        ]);
    }

    /**
     * Mark notification as unread
     */
    public function markAsUnread()
    {
        $this->update([
            'is_read' => false,
            'read_at' => null
        ]);
    }

    /**
     * Get the related model (Order, User, etc.)
     */
    public function related()
    {
        return $this->morphTo('related');
    }

    /**
     * Get human readable time difference
     */
    public function getTimeAgoAttribute()
    {
        return $this->created_at->diffForHumans();
    }

    /**
     * Get priority badge class for UI
     */
    public function getPriorityBadgeAttribute()
    {
        return match($this->priority) {
            'low' => 'badge-secondary',
            'normal' => 'badge-primary',
            'high' => 'badge-warning',
            'urgent' => 'badge-danger',
            default => 'badge-primary'
        };
    }

    /**
     * Get priority color for UI
     */
    public function getPriorityColorAttribute()
    {
        return match($this->priority) {
            'low' => '#6c757d',
            'normal' => '#007bff',
            'high' => '#ffc107',
            'urgent' => '#dc3545',
            default => '#007bff'
        };
    }

    /**
     * Create a new order notification
     */
    public static function createOrderNotification($order, $type = 'order_created')
    {
        $titles = [
            'order_created' => 'New Order Received',
            'order_updated' => 'Order Updated',
            'order_cancelled' => 'Order Cancelled',
            'payment_received' => 'Payment Received'
        ];

        $messages = [
            'order_created' => "New order #{$order->id} from {$order->client_name} {$order->client_lastname}",
            'order_updated' => "Order #{$order->id} has been updated",
            'order_cancelled' => "Order #{$order->id} has been cancelled",
            'payment_received' => "Payment received for order #{$order->id}"
        ];

        $priority = match($type) {
            'order_created' => 'high',
            'payment_received' => 'high',
            'order_cancelled' => 'normal',
            default => 'normal'
        };

        return self::create([
            'type' => $type,
            'title' => $titles[$type] ?? 'Order Notification',
            'message' => $messages[$type] ?? "Order #{$order->id} notification",
            'data' => [
                'order_id' => $order->id,
                'customer_name' => $order->client_name . ' ' . $order->client_lastname,
                'customer_email' => $order->email,
                'customer_phone' => $order->phone,
                'product_name' => $order->product->name ?? 'Unknown Product',
                'total_amount' => $order->product->current_price ?? '0.00',
                'payment_method' => $order->payment_method,
                'order_status' => $order->status,
                'created_at' => $order->created_at->toISOString()
            ],
            'related_id' => $order->id,
            'related_type' => 'App\\Models\\Order',
            'action_url' => "/admin/orders/{$order->id}",
            'priority' => $priority
        ]);
    }

    /**
     * Get recent notifications for dashboard
     */
    public static function getRecentNotifications($limit = 10)
    {
        return self::latest()
            ->limit($limit)
            ->get();
    }

    /**
     * Get unread count
     */
    public static function getUnreadCount()
    {
        return self::unread()->count();
    }

    /**
     * Mark all notifications as read
     */
    public static function markAllAsRead()
    {
        return self::unread()->update([
            'is_read' => true,
            'read_at' => now()
        ]);
    }
}
