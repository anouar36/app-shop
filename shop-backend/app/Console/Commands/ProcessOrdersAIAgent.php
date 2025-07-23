<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\OrderMonitoringAIAgent;
use App\Services\OrderExcelExportService;

class ProcessOrdersAIAgent extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:ai-agent 
                          {--threshold=5 : Minimum number of processing orders to trigger report}
                          {--force : Force send report regardless of conditions}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run the AI agent to monitor processing orders and send Excel reports';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🤖 Starting AI Agent for Order Monitoring...');
        $this->newLine();

        try {
            // Initialize services
            $excelService = new OrderExcelExportService();
            $aiAgent = new OrderMonitoringAIAgent($excelService);

            // Set custom threshold if provided
            $threshold = (int) $this->option('threshold');
            $aiAgent->setThreshold($threshold);

            $this->info("📊 Monitoring orders with threshold: {$threshold} processing orders");

            // Show current status
            $status = $aiAgent->getStatus();
            $this->displayStatus($status);

            // Execute the AI agent
            if ($this->option('force')) {
                $this->warn('⚡ Force mode enabled - sending report regardless of conditions');
                $result = $aiAgent->forceSendReport();
            } else {
                $result = $aiAgent->executeMonitoring();
            }

            // Display results
            $this->displayResults($result);

        } catch (\Exception $e) {
            $this->error('❌ AI Agent failed: ' . $e->getMessage());
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }

    /**
     * Display current status
     */
    private function displayStatus(array $status): void
    {
        $this->info('📋 Current Status:');
        $this->line("   Processing Orders: {$status['current_processing_orders']}");
        $this->line("   Threshold: {$status['threshold']}");
        $this->line("   Threshold Met: " . ($status['threshold_met'] ? '✅ Yes' : '❌ No'));
        $this->line("   Can Send Report: " . ($status['can_send_report'] ? '✅ Yes' : '❌ No'));
        $this->line("   Last Report: {$status['last_report_sent']}");
        $this->line("   Admin Emails: " . implode(', ', $status['admin_emails']));
        $this->newLine();
    }

    /**
     * Display execution results
     */
    private function displayResults(array $result): void
    {
        $this->newLine();
        
        switch ($result['status']) {
            case 'success':
                $this->info('✅ AI Agent executed successfully!');
                $this->line("📊 Orders processed: {$result['orders_processed']}");
                $this->line("📧 Emails sent: {$result['emails_sent']}");
                $this->line("📄 File generated: {$result['file_generated']}");
                $this->line("⏰ Execution time: {$result['execution_time']}");
                
                if (!empty($result['email_errors'])) {
                    $this->warn('⚠️ Some email sending errors occurred:');
                    foreach ($result['email_errors'] as $error) {
                        $this->line("   {$error['email']}: {$error['error']}");
                    }
                }
                
                // Display summary
                $summary = $result['report_summary'];
                $this->info('📈 Report Summary:');
                $this->line("   Total Value: $" . number_format($summary['total_value'], 2));
                $this->line("   Average Order: $" . number_format($summary['average_order_value'], 2));
                $this->line("   With Addresses: {$summary['orders_with_location']}");
                break;

            case 'no_action':
                $this->warn('⏸️ No action taken');
                $this->line("Reason: {$result['message']}");
                $this->line("Current processing orders: {$result['processing_orders_count']}");
                $this->line("Required threshold: {$result['threshold']}");
                break;

            case 'no_orders':
                $this->warn('📭 No processing orders found');
                break;

            case 'error':
                $this->error('❌ AI Agent error: ' . $result['message']);
                break;

            default:
                $this->line('🔄 AI Agent completed with status: ' . $result['status']);
                $this->line(json_encode($result, JSON_PRETTY_PRINT));
        }

        $this->newLine();
        $this->info('🤖 AI Agent monitoring complete.');
    }
}
