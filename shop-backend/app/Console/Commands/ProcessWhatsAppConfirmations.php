<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\WhatsAppAutoConfirmService;

class ProcessWhatsAppConfirmations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'whatsapp:process-confirmations';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically process WhatsApp order confirmations and update order status';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Starting WhatsApp Auto-Confirmation Service...');
        
        $autoConfirmService = new WhatsAppAutoConfirmService();
        $processedCount = $autoConfirmService->processAutoConfirmations();
        
        if ($processedCount > 0) {
            $this->info("✅ Processed {$processedCount} order confirmations successfully!");
        } else {
            $this->comment('ℹ️  No pending confirmations found.');
        }
        
        $this->info('🏁 WhatsApp Auto-Confirmation Service completed.');
        
        return Command::SUCCESS;
    }
}
