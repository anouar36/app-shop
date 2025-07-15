<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\AdminNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EnhancedOrderNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $order;
    public $notification;
    public $actionUrl;

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order, AdminNotification $notification = null)
    {
        $this->order = $order;
        $this->notification = $notification;
        $this->actionUrl = config('app.frontend_url', 'http://localhost:3000') . "/admin/orders/{$order->id}";
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "ðŸ›’ New Order #{$this->order->id} - Action Required",
            from: config('mail.from.address'),
            replyTo: config('mail.from.address')
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            html: 'emails.enhanced-order-notification',
            text: 'emails.enhanced-order-notification-text'
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->html('emails.enhanced-order-notification')
                    ->text('emails.enhanced-order-notification-text')
                    ->with([
                        'order' => $this->order,
                        'notification' => $this->notification,
                        'actionUrl' => $this->actionUrl,
                        'dashboardUrl' => config('app.frontend_url', 'http://localhost:3000') . '/admin/dashboard',
                        'customerName' => $this->order->client_name . ' ' . $this->order->client_lastname,
                        'productName' => $this->order->product->name ?? 'Unknown Product',
                        'totalAmount' => $this->order->product->current_price ?? '0.00',
                        'formattedDate' => $this->order->created_at->format('F j, Y \a\t g:i A'),
                        'urgencyLevel' => $this->notification?->priority ?? 'normal'
                    ]);
    }
}
