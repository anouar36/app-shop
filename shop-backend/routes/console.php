<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule WhatsApp auto-confirmation to run every 2 minutes
Schedule::command('whatsapp:process-confirmations')
    ->everyTwoMinutes()
    ->withoutOverlapping()
    ->onSuccess(function () {
        \Log::info('WhatsApp auto-confirmation scheduled task completed successfully');
    })
    ->onFailure(function () {
        \Log::error('WhatsApp auto-confirmation scheduled task failed');
    });

// Schedule AI Agent for processing orders monitoring every 10 minutes
Schedule::command('orders:ai-agent')
    ->everyTenMinutes()
    ->withoutOverlapping()
    ->onSuccess(function () {
        \Log::info('🤖 AI Agent scheduled task completed successfully');
    })
    ->onFailure(function () {
        \Log::error('🤖 AI Agent scheduled task failed');
    });

// Schedule WhatsApp REAL-TIME processing to run every 30 seconds
Schedule::command('whatsapp:process-realtime')
    ->everyThirtySeconds()
    ->withoutOverlapping()
    ->onSuccess(function () {
        \Log::info('WhatsApp REAL-TIME confirmation task completed successfully');
    })
    ->onFailure(function () {
        \Log::error('WhatsApp REAL-TIME confirmation task failed');
    });
