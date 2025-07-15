<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\AdminNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EnhancedOrderNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $notification;

    public function __construct(Order $order, AdminNotification $notification = null)
    {
        $this->order = $order;
        $this->notification = $notification;
    }

    public function build()
    {
        return $this->view('emails.enhanced-order-notification')
                    ->subject("🛒 New Order #{$this->order->id} - Action Required")
                    ->with([
                        'order' => $this->order,
                        'notification' => $this->notification,
                        'actionUrl' => config('app.frontend_url', 'http://localhost:3000') . "/admin/orders/{$this->order->id}",
                        'dashboardUrl' => config('app.frontend_url', 'http://localhost:3000') . '/admin/dashboard',
                        'customerName' => $this->order->client_name . ' ' . $this->order->client_lastname,
                        'productName' => $this->order->product->name ?? 'Unknown Product',
                        'totalAmount' => $this->order->product->current_price ?? '0.00',
                        'formattedDate' => $this->order->created_at->format('F j, Y \a\t g:i A'),
                        'urgencyLevel' => $this->notification?->priority ?? 'normal'
                    ]);
    }
}