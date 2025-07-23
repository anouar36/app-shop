<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Queue\SerializesModels;

class ProcessingOrdersReport extends Mailable
{
    use Queueable, SerializesModels;

    public $ordersCount;
    public $reportSummary;
    public $filePath;

    /**
     * Create a new message instance.
     */
    public function __construct(int $ordersCount, array $reportSummary, string $filePath)
    {
        $this->ordersCount = $ordersCount;
        $this->reportSummary = $reportSummary;
        $this->filePath = $filePath;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '📊 Processing Orders Report - ' . $this->ordersCount . ' Orders Ready',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.processing-orders-report',
            with: [
                'ordersCount' => $this->ordersCount,
                'reportSummary' => $this->reportSummary,
                'totalValue' => '$' . number_format($this->reportSummary['total_value'], 2),
                'averageValue' => '$' . number_format($this->reportSummary['average_order_value'], 2),
                'generatedAt' => $this->reportSummary['generated_at'],
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
        return [
            Attachment::fromPath($this->filePath)
                ->as('processing_orders_report_' . now()->format('Y-m-d') . '.csv')
                ->withMime('text/csv'),
        ];
    }
}
