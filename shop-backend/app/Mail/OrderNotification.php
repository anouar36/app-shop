<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $order;

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $orderNumber = '#ORD-' . str_pad($this->order->id, 4, '0', STR_PAD_LEFT);
        $customerType = $this->order->client_id ? 'Authenticated User' : 'Guest';
        
        return new Envelope(
            subject: "New Order Received - {$orderNumber} ({$customerType})",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.order-notification',
            with: [
                'order' => $this->order,
                'orderNumber' => '#ORD-' . str_pad($this->order->id, 4, '0', STR_PAD_LEFT),
                'customerType' => $this->order->client_id ? 'Authenticated User' : 'Guest',
                'productName' => $this->order->product ? $this->order->product->name : 'Product not found',
                'productPrice' => $this->order->product ? '$' . number_format($this->order->product->price, 2) : '$0.00'
            ]
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
}
