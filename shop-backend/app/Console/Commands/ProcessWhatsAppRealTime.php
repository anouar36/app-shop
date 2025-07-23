<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\WhatsAppRealTimeService;

class ProcessWhatsAppRealTime extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'whatsapp:process-realtime';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process WhatsApp order confirmations in REAL-TIME (instant updates)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('⚡ Starting WhatsApp REAL-TIME Confirmation Service...');
        
        $realTimeService = new WhatsAppRealTimeService();
        $processedCount = $realTimeService->processRealTimeConfirmations();
        
        if ($processedCount > 0) {
            $this->info("🎉 INSTANTLY processed {$processedCount} order confirmations!");
            $this->line("✅ Orders updated to 'processing' status in REAL-TIME!");
        } else {
            $this->comment('ℹ️  No pending confirmations found for instant processing.');
        }
        
        $this->info('⚡ WhatsApp REAL-TIME Service completed.');
        
        return Command::SUCCESS;
    }
}
