<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OrderExcelExportService
{
    /**
     * Generate Excel file for processing orders
     *
     * @param Collection $orders
     * @return string File path
     */    public function generateExcelFile(Collection $orders): string
    {
        try {
            // Create CSV content (Excel compatible)
            $csvContent = $this->generateCsvContent($orders);
            
            Log::info('Generated CSV content', [
                'content_length' => strlen($csvContent),
                'orders_count' => $orders->count()
            ]);
            
            // Generate unique filename
            $filename = 'processing_orders_' . now()->format('Y-m-d_H-i-s') . '.csv';
            
            // Try different approaches for file storage
            try {
                // Method 1: Use Storage facade with forward slashes (Laravel convention)
                $storageFilepath = 'exports/' . $filename;
                $result = Storage::disk('local')->put($storageFilepath, $csvContent);
                
                Log::info('Storage put result', [
                    'result' => $result,
                    'storage_filepath' => $storageFilepath
                ]);
                
                // Get the full absolute path
                $fullPath = storage_path('app/' . $storageFilepath);
                
                Log::info('Generated full path', [
                    'full_path' => $fullPath,
                    'file_exists' => file_exists($fullPath)
                ]);
                
                if (file_exists($fullPath)) {
                    Log::info('Excel file generated successfully', [
                        'filename' => $filename,
                        'full_path' => $fullPath,
                        'orders_count' => $orders->count(),
                        'file_size' => filesize($fullPath) . ' bytes'
                    ]);
                    
                    return $fullPath;
                }
                
                // Method 2: Direct file_put_contents if Storage didn't work
                Log::warning('Storage method failed, trying direct file creation');
                
                // Ensure directory exists
                $exportDir = storage_path('app/exports');
                if (!is_dir($exportDir)) {
                    mkdir($exportDir, 0755, true);
                    Log::info('Created exports directory', ['dir' => $exportDir]);
                }
                
                $directPath = $exportDir . DIRECTORY_SEPARATOR . $filename;
                $bytesWritten = file_put_contents($directPath, $csvContent);
                
                if ($bytesWritten !== false && file_exists($directPath)) {
                    Log::info('Direct file creation successful', [
                        'path' => $directPath,
                        'bytes_written' => $bytesWritten
                    ]);
                    return $directPath;
                }
                
                throw new \Exception("Failed to create file using both Storage and direct methods");
                
            } catch (\Exception $e) {
                Log::error('File storage error', [
                    'error' => $e->getMessage(),
                    'filename' => $filename
                ]);
                throw $e;
            }
            
        } catch (\Exception $e) {
            Log::error('Failed to generate Excel file: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Generate CSV content from orders
     *
     * @param Collection $orders
     * @return string
     */
    private function generateCsvContent(Collection $orders): string
    {
        $csv = [];
        
        // Add header row
        $headers = [
            'Order ID',
            'Order Price',
            'Product Name',
            'Client Location',
            'Client Name',
            'Client Email',
            'Client Phone',
            'Order Creation Date',
            'Expected Arrival Date',
            'Payment Method',
            'Payment Status',
            'Order Status',
            'Quantity',
            'Special Instructions',
            'Delivery Notes'
        ];
        
        $csv[] = $this->arrayToCsvLine($headers);
        
        // Add data rows
        foreach ($orders as $order) {
            $row = [
                $order->id,
                $order->product ? '$' . number_format($order->product->current_price ?? $order->product->price, 2) : 'N/A',
                $order->product ? $order->product->name : 'Product not found',
                $order->delivery_address ?? 'Not specified',
                $order->client_name . ' ' . $order->client_lastname,
                $order->email,
                $order->phone,
                $order->date_creation ? $order->date_creation->format('Y-m-d H:i:s') : $order->created_at->format('Y-m-d H:i:s'),
                $order->date_arrival ? $order->date_arrival->format('Y-m-d') : 'Not set',
                $order->method_payment,
                $order->payment_status ?? 'pending',
                $order->status,
                $order->quantity ?? 1,
                $order->special_instructions ?? 'None',
                $order->delivery_notes ?? 'None'
            ];
            
            $csv[] = $this->arrayToCsvLine($row);
        }
        
        return implode("\n", $csv);
    }

    /**
     * Convert array to CSV line
     *
     * @param array $data
     * @return string
     */
    private function arrayToCsvLine(array $data): string
    {
        $line = [];
        foreach ($data as $field) {
            // Escape quotes and wrap in quotes if necessary
            $field = str_replace('"', '""', $field);
            if (strpos($field, ',') !== false || strpos($field, '"') !== false || strpos($field, "\n") !== false) {
                $field = '"' . $field . '"';
            }
            $line[] = $field;
        }
        return implode(',', $line);
    }

    /**
     * Get processing orders (status = 'processing')
     *
     * @return Collection
     */
    public function getProcessingOrders(): Collection
    {
        return Order::with(['product', 'client'])
            ->where('status', 'processing')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Check if there are enough processing orders to trigger export
     *
     * @param int $minimumCount
     * @return bool
     */
    public function shouldTriggerExport(int $minimumCount = 5): bool
    {
        $count = Order::where('status', 'processing')->count();
        
        Log::info('Checking processing orders count', [
            'current_count' => $count,
            'minimum_required' => $minimumCount,
            'should_trigger' => $count >= $minimumCount
        ]);
        
        return $count >= $minimumCount;
    }

    /**
     * Get summary statistics for the report
     *
     * @param Collection $orders
     * @return array
     */
    public function getReportSummary(Collection $orders): array
    {
        $totalValue = $orders->sum(function ($order) {
            return $order->product ? ($order->product->current_price ?? $order->product->price) * ($order->quantity ?? 1) : 0;
        });

        $paymentMethods = $orders->groupBy('payment_method')->map->count();
        $locations = $orders->filter(function ($order) {
            return !empty($order->delivery_address);
        })->count();

        return [
            'total_orders' => $orders->count(),
            'total_value' => $totalValue,
            'average_order_value' => $orders->count() > 0 ? $totalValue / $orders->count() : 0,
            'payment_methods' => $paymentMethods->toArray(),
            'orders_with_location' => $locations,
            'generated_at' => now()->format('Y-m-d H:i:s'),
        ];
    }
}
