<?php

namespace App\Services;

use App\Models\Order;
use App\Models\User;
use App\Mail\ProcessingOrdersReport;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class OrderMonitoringAIAgent
{
    private OrderExcelExportService $excelService;
    private int $minimumOrderThreshold;
    private string $cacheKey = 'ai_agent_last_report_sent';

    public function __construct(OrderExcelExportService $excelService)
    {
        $this->excelService = $excelService;
        $this->minimumOrderThreshold = 5; // Default threshold
    }

    /**
     * Main AI agent execution method
     * Checks orders and sends report if conditions are met
     */
    public function executeMonitoring(): array
    {
        try {
            Log::info('🤖 AI Agent: Starting order monitoring execution');

            // Check if we should trigger a report
            if (!$this->shouldTriggerReport()) {
                return [
                    'status' => 'no_action',
                    'message' => 'Conditions not met for report generation',
                    'processing_orders_count' => Order::where('status', 'processing')->count(),
                    'threshold' => $this->minimumOrderThreshold
                ];
            }

            // Generate the report
            $result = $this->generateAndSendReport();
            
            // Mark that we sent a report
            $this->markReportSent();

            Log::info('🤖 AI Agent: Successfully completed monitoring execution', $result);

            return $result;

        } catch (\Exception $e) {
            Log::error('🤖 AI Agent: Error during monitoring execution', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'status' => 'error',
                'message' => 'AI Agent encountered an error: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Check if we should trigger a report
     */
    private function shouldTriggerReport(): bool
    {
        // Check if we have enough processing orders
        if (!$this->excelService->shouldTriggerExport($this->minimumOrderThreshold)) {
            return false;
        }

        // Check if we haven't sent a report recently (prevent spam)
        $lastReportTime = Cache::get($this->cacheKey);
        if ($lastReportTime) {
            $hoursSinceLastReport = now()->diffInHours($lastReportTime);
            if ($hoursSinceLastReport < 2) { // Don't send more than once every 2 hours
                Log::info('🤖 AI Agent: Skipping report - sent recently', [
                    'last_report_time' => $lastReportTime,
                    'hours_since' => $hoursSinceLastReport
                ]);
                return false;
            }
        }

        return true;
    }

    /**
     * Generate Excel report and send email
     */
    private function generateAndSendReport(): array
    {
        // Get processing orders
        $orders = $this->excelService->getProcessingOrders();
        
        if ($orders->isEmpty()) {
            return [
                'status' => 'no_orders',
                'message' => 'No processing orders found'
            ];
        }        // Generate Excel file
        $filePath = $this->excelService->generateExcelFile($orders);
        
        // Verify file exists before proceeding
        if (!file_exists($filePath)) {
            Log::error('🤖 AI Agent: Generated file does not exist', [
                'file_path' => $filePath
            ]);
            return [
                'status' => 'error',
                'message' => 'Generated Excel file does not exist at: ' . $filePath
            ];
        }
        
        // Get report summary
        $reportSummary = $this->excelService->getReportSummary($orders);
        
        // Get admin emails
        $adminEmails = $this->getAdminEmails();
        
        // Send email to each admin
        $emailsSent = 0;
        $emailErrors = [];
        
        foreach ($adminEmails as $adminEmail) {
            try {
                Mail::to($adminEmail)->send(new ProcessingOrdersReport(
                    $orders->count(),
                    $reportSummary,
                    $filePath
                ));
                $emailsSent++;
                
                Log::info('🤖 AI Agent: Report email sent successfully', [
                    'recipient' => $adminEmail,
                    'orders_count' => $orders->count()
                ]);
                
            } catch (\Exception $e) {
                $emailErrors[] = [
                    'email' => $adminEmail,
                    'error' => $e->getMessage()
                ];
                
                Log::error('🤖 AI Agent: Failed to send report email', [
                    'recipient' => $adminEmail,
                    'error' => $e->getMessage()
                ]);
            }
        }

        // Clean up temporary file
        $this->cleanupTempFile($filePath);

        return [
            'status' => 'success',
            'message' => 'AI Agent successfully generated and sent processing orders report',
            'orders_processed' => $orders->count(),
            'emails_sent' => $emailsSent,
            'admin_emails' => $adminEmails,
            'email_errors' => $emailErrors,
            'report_summary' => $reportSummary,
            'file_generated' => basename($filePath),
            'execution_time' => now()->toDateTimeString()
        ];
    }    /**
     * Get admin email addresses
     */
    private function getAdminEmails(): array
    {
        try {
            // Priority 1: Environment configuration (your preferred email)
            $primaryEmail = env('MAIL_ADMIN_EMAIL');
            if ($primaryEmail) {
                Log::info('🤖 AI Agent: Using primary admin email from environment', [
                    'email' => $primaryEmail
                ]);
                return [$primaryEmail];
            }
            
            // Priority 2: Try to get admin emails from User model
            $adminEmails = User::getAdminEmails();
            
            if (!empty($adminEmails)) {
                Log::info('🤖 AI Agent: Using admin emails from User model', [
                    'emails' => $adminEmails,
                    'count' => count($adminEmails)
                ]);
                return $adminEmails;
            }
            
            // Priority 3: Fallback to mail from address
            $fallbackEmail = env('MAIL_FROM_ADDRESS', 'admin@shop.com');
            
            Log::info('🤖 AI Agent: Using fallback email', [
                'email' => $fallbackEmail
            ]);
            
            return [$fallbackEmail];
            
        } catch (\Exception $e) {
            Log::error('🤖 AI Agent: Error getting admin emails', [
                'error' => $e->getMessage()
            ]);
            
            // Final fallback
            return [env('MAIL_FROM_ADDRESS', 'admin@shop.com')];
        }
    }

    /**
     * Mark that we sent a report (to prevent spam)
     */
    private function markReportSent(): void
    {
        Cache::put($this->cacheKey, now(), now()->addHours(24)); // Cache for 24 hours
    }

    /**
     * Clean up temporary file
     */
    private function cleanupTempFile(string $filePath): void
    {
        try {
            if (file_exists($filePath)) {
                unlink($filePath);
                Log::info('🤖 AI Agent: Cleaned up temporary file', ['file' => $filePath]);
            }
        } catch (\Exception $e) {
            Log::warning('🤖 AI Agent: Could not clean up temporary file', [
                'file' => $filePath,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Set custom threshold for triggering reports
     */
    public function setThreshold(int $threshold): self
    {
        $this->minimumOrderThreshold = $threshold;
        return $this;
    }

    /**
     * Get current status of the AI agent
     */
    public function getStatus(): array
    {
        $processingOrders = Order::where('status', 'processing')->count();
        $lastReportTime = Cache::get($this->cacheKey);
        
        return [
            'agent_active' => true,
            'current_processing_orders' => $processingOrders,
            'threshold' => $this->minimumOrderThreshold,
            'threshold_met' => $processingOrders >= $this->minimumOrderThreshold,
            'last_report_sent' => $lastReportTime ? $lastReportTime->toDateTimeString() : 'Never',
            'can_send_report' => $this->shouldTriggerReport(),
            'admin_emails' => $this->getAdminEmails(),
            'next_check' => 'Continuous monitoring active'
        ];
    }

    /**
     * Force send a report (for testing or manual trigger)
     */
    public function forceSendReport(): array
    {
        Log::info('🤖 AI Agent: Force sending report requested');
        
        // Temporarily clear the cache to allow immediate sending
        Cache::forget($this->cacheKey);
        
        return $this->executeMonitoring();
    }
}
