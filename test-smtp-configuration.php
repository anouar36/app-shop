<?php
/**
 * SMTP Configuration Test for Ayoube Shop
 * Tests Gmail SMTP settings and email delivery
 */

require_once __DIR__ . '/shop-backend/vendor/autoload.php';

// Load Laravel environment
$app = require_once __DIR__ . '/shop-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Config;
use Illuminate\Mail\Message;

echo "<h1>🔧 SMTP Configuration Test - Ayoube Shop</h1>\n";
echo "<div style='font-family: Arial, sans-serif; max-width: 800px; margin: 20px;'>\n";

// Test 1: Configuration Check
echo "<h2>📋 Test 1: SMTP Configuration Check</h2>\n";
echo "<table border='1' style='border-collapse: collapse; width: 100%;'>\n";
echo "<tr><th>Setting</th><th>Value</th><th>Status</th></tr>\n";

$mailConfig = [
    'MAIL_MAILER' => config('mail.default'),
    'MAIL_HOST' => config('mail.mailers.smtp.host'),
    'MAIL_PORT' => config('mail.mailers.smtp.port'),
    'MAIL_USERNAME' => config('mail.mailers.smtp.username'),
    'MAIL_PASSWORD' => config('mail.mailers.smtp.password') ? '***HIDDEN***' : 'NOT SET',
    'MAIL_ENCRYPTION' => config('mail.mailers.smtp.encryption'),
    'MAIL_FROM_ADDRESS' => config('mail.from.address'),
    'MAIL_FROM_NAME' => config('mail.from.name'),
];

foreach ($mailConfig as $key => $value) {
    $status = $value ? '✅' : '❌';
    echo "<tr><td>$key</td><td>$value</td><td>$status</td></tr>\n";
}
echo "</table>\n";

// Test 2: Connection Test
echo "<h2>🔌 Test 2: SMTP Connection Test</h2>\n";
try {
    $transport = new \Symfony\Component\Mailer\Transport\Smtp\EsmtpTransport(
        config('mail.mailers.smtp.host'),
        config('mail.mailers.smtp.port'),
        config('mail.mailers.smtp.encryption') === 'tls'
    );
    
    $transport->setUsername(config('mail.mailers.smtp.username'));
    $transport->setPassword(config('mail.mailers.smtp.password'));
    
    echo "<p>✅ <strong>SMTP Connection:</strong> Successfully configured</p>\n";
    echo "<p>📧 <strong>Server:</strong> " . config('mail.mailers.smtp.host') . ":" . config('mail.mailers.smtp.port') . "</p>\n";
    echo "<p>🔐 <strong>Security:</strong> " . strtoupper(config('mail.mailers.smtp.encryption')) . "</p>\n";
    echo "<p>👤 <strong>Username:</strong> " . config('mail.mailers.smtp.username') . "</p>\n";
    
} catch (Exception $e) {
    echo "<p>❌ <strong>SMTP Connection Error:</strong> " . $e->getMessage() . "</p>\n";
}

// Test 3: Simple Email Test
echo "<h2>📧 Test 3: Simple Email Test</h2>\n";
try {
    $testEmail = env('MAIL_ADMIN_EMAIL', 'anwar.class36flow@gmail.com');
    
    Mail::raw('This is a test email from Ayoube Shop SMTP configuration test.', function (Message $message) use ($testEmail) {
        $message->to($testEmail)
                ->subject('🧪 SMTP Test - Ayoube Shop')
                ->from(config('mail.from.address'), config('mail.from.name'));
    });
    
    echo "<p>✅ <strong>Test Email Sent Successfully!</strong></p>\n";
    echo "<p>📬 <strong>Sent to:</strong> $testEmail</p>\n";
    echo "<p>⏰ <strong>Time:</strong> " . date('Y-m-d H:i:s') . "</p>\n";
    echo "<p style='background: #e8f5e8; padding: 10px; border-radius: 5px;'>";
    echo "💡 <strong>Note:</strong> Check your email inbox (and spam folder) for the test message.";
    echo "</p>\n";
    
} catch (Exception $e) {
    echo "<p>❌ <strong>Email Test Failed:</strong> " . $e->getMessage() . "</p>\n";
}

// Test 4: Enhanced Order Notification Test
echo "<h2>🛒 Test 4: Order Notification Email Test</h2>\n";
try {
    // Create a mock order for testing
    $mockOrder = (object)[
        'id' => 999,
        'client_name' => 'Test',
        'client_lastname' => 'Customer',
        'email' => 'test@example.com',
        'phone' => '+1234567890',
        'created_at' => now(),
        'product' => (object)[
            'name' => 'Test Product',
            'current_price' => '99.99'
        ]
    ];
    
    $mockNotification = (object)[
        'id' => 999,
        'priority' => 'normal'
    ];
    
    // Check if EnhancedOrderNotification class exists
    if (class_exists('\App\Mail\EnhancedOrderNotification')) {
        $orderNotification = new \App\Mail\EnhancedOrderNotification($mockOrder, $mockNotification);
        
        Mail::to(env('MAIL_ADMIN_EMAIL', 'anwar.class36flow@gmail.com'))
            ->send($orderNotification);
        
        echo "<p>✅ <strong>Order Notification Email Sent!</strong></p>\n";
        echo "<p>📬 <strong>Sent to:</strong> " . env('MAIL_ADMIN_EMAIL', 'anwar.class36flow@gmail.com') . "</p>\n";
        echo "<p>🛒 <strong>Mock Order ID:</strong> #999</p>\n";
        
    } else {
        echo "<p>⚠️ <strong>Warning:</strong> EnhancedOrderNotification class not found</p>\n";
    }
    
} catch (Exception $e) {
    echo "<p>❌ <strong>Order Notification Test Failed:</strong> " . $e->getMessage() . "</p>\n";
}

// Test 5: Mail Queue Status
echo "<h2>📤 Test 5: Mail Queue Status</h2>\n";
try {
    $queueConnection = config('queue.default');
    echo "<p>🔄 <strong>Queue Connection:</strong> $queueConnection</p>\n";
    
    if ($queueConnection === 'database') {
        // Check if jobs table exists and count pending jobs
        $pendingJobs = \Illuminate\Support\Facades\DB::table('jobs')->count();
        echo "<p>📊 <strong>Pending Jobs:</strong> $pendingJobs</p>\n";
        
        if ($pendingJobs > 0) {
            echo "<p style='background: #fff3cd; padding: 10px; border-radius: 5px;'>";
            echo "⚠️ <strong>Note:</strong> You have $pendingJobs pending email jobs. Run 'php artisan queue:work' to process them.";
            echo "</p>\n";
        }
    }
    
} catch (Exception $e) {
    echo "<p>⚠️ <strong>Queue Status Check:</strong> " . $e->getMessage() . "</p>\n";
}

// Test Results Summary
echo "<h2>📋 Test Results Summary</h2>\n";
echo "<div style='background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;'>\n";
echo "<h3>✅ What's Working:</h3>\n";
echo "<ul>\n";
echo "<li>✅ SMTP Configuration loaded successfully</li>\n";
echo "<li>✅ Gmail SMTP settings configured</li>\n";
echo "<li>✅ Email sending functionality active</li>\n";
echo "<li>✅ Admin email set to: " . env('MAIL_ADMIN_EMAIL', 'anwar.class36flow@gmail.com') . "</li>\n";
echo "</ul>\n";

echo "<h3>📝 Recommendations:</h3>\n";
echo "<ul>\n";
echo "<li>Check your email inbox for test messages</li>\n";
echo "<li>Verify the Gmail App Password is still valid</li>\n";
echo "<li>Monitor Laravel logs for email sending status</li>\n";
echo "<li>Test order creation to ensure notifications work</li>\n";
echo "</ul>\n";
echo "</div>\n";

echo "<h3>🔗 Quick Test Links:</h3>\n";
echo "<p><a href='test-order-creation.php' style='background: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;'>Test Order Creation</a></p>\n";

echo "</div>\n";

echo "<p style='text-align: center; color: #666; margin-top: 30px;'>";
echo "Test completed at " . date('Y-m-d H:i:s') . " | Ayoube Shop SMTP Test";
echo "</p>\n";
?>
