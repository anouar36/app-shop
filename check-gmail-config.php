<?php

/**
 * Gmail App Password Configuration Checker
 * 
 * This script checks if Gmail App Password is properly configured
 * for Laravel email functionality and displays current mail settings.
 * 
 * Run from Laravel root directory: php check-gmail-config.php
 */

echo "\n";
echo "==================================================\n";
echo "📧 Gmail App Password Configuration Checker\n";
echo "==================================================\n\n";

// Check if we're in Laravel root
if (!file_exists('artisan') || !file_exists('bootstrap/app.php')) {
    echo "❌ ERROR: This script must be run from Laravel root directory\n";
    echo "   Current directory: " . getcwd() . "\n";
    echo "   Expected files: artisan, bootstrap/app.php\n\n";
    echo "💡 Usage: cd shop-backend && php ../check-gmail-config.php\n\n";
    exit(1);
}

try {
    // Bootstrap Laravel
    require_once 'vendor/autoload.php';
    $app = require_once 'bootstrap/app.php';
    $app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

    echo "✅ Laravel application loaded successfully\n\n";

} catch (Exception $e) {
    echo "❌ Failed to load Laravel application\n";
    echo "   Error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Get mail configuration
echo "🔍 MAIL CONFIGURATION ANALYSIS\n";
echo "================================\n\n";

// Basic mail settings
$mailDriver = config('mail.default', 'Not set');
$mailHost = config('mail.mailers.smtp.host', 'Not set');
$mailPort = config('mail.mailers.smtp.port', 'Not set');
$mailUsername = config('mail.mailers.smtp.username', 'Not set');
$mailPassword = config('mail.mailers.smtp.password', 'Not set');
$mailEncryption = config('mail.mailers.smtp.encryption', 'Not set');
$mailFromAddress = config('mail.from.address', 'Not set');
$mailFromName = config('mail.from.name', 'Not set');

// Admin email setting
$adminEmail = config('mail.admin_email', env('MAIL_ADMIN_EMAIL', 'Not set'));

echo "📋 Basic Configuration:\n";
echo "========================\n";
printf("%-20s %s\n", "Mail Driver:", $mailDriver);
printf("%-20s %s\n", "SMTP Host:", $mailHost);
printf("%-20s %s\n", "SMTP Port:", $mailPort);
printf("%-20s %s\n", "SMTP Encryption:", $mailEncryption);
printf("%-20s %s\n", "From Address:", $mailFromAddress);
printf("%-20s %s\n", "From Name:", $mailFromName);
printf("%-20s %s\n", "Admin Email:", $adminEmail);
echo "\n";

echo "🔐 Authentication Analysis:\n";
echo "============================\n";
printf("%-20s %s\n", "SMTP Username:", $mailUsername);

// Check password status
$passwordStatus = "❌ NOT SET";
$passwordAdvice = "";
$isPlaceholder = false;

if (empty($mailPassword) || $mailPassword === 'Not set') {
    $passwordStatus = "❌ EMPTY/NOT SET";
    $passwordAdvice = "Password is completely missing from configuration";
} else {
    // Check for common placeholder values
    $placeholders = [
        'your_gmail_app_password_here',
        'your_app_password',
        'app_password_here',
        'gmail_password',
        'password',
        'your_password',
        'change_me',
        'placeholder'
    ];
    
    $lowerPassword = strtolower($mailPassword);
    foreach ($placeholders as $placeholder) {
        if (strpos($lowerPassword, $placeholder) !== false) {
            $isPlaceholder = true;
            break;
        }
    }
    
    if ($isPlaceholder) {
        $passwordStatus = "❌ PLACEHOLDER DETECTED";
        $passwordAdvice = "Current value appears to be a placeholder, not a real Gmail App Password";
    } else {
        // Check if it looks like a valid Gmail App Password
        $cleanPassword = str_replace(' ', '', $mailPassword);
        
        if (strlen($cleanPassword) === 16 && ctype_alnum($cleanPassword)) {
            $passwordStatus = "✅ LOOKS VALID (16 characters, alphanumeric)";
            $passwordAdvice = "Password format appears correct for Gmail App Password";
        } elseif (strlen($cleanPassword) > 10 && strlen($cleanPassword) < 20) {
            $passwordStatus = "⚠️  POSSIBLY VALID (unusual length: " . strlen($cleanPassword) . ")";
            $passwordAdvice = "Password exists but length is unusual for Gmail App Password";
        } else {
            $passwordStatus = "❌ INVALID FORMAT";
            $passwordAdvice = "Password doesn't match Gmail App Password format (should be 16 alphanumeric characters)";
        }
    }
}

printf("%-20s %s\n", "Password Status:", $passwordStatus);
printf("%-20s %s\n", "Password Length:", strlen($mailPassword) . " characters");

// Show partial password for verification (mask middle characters)
if (!empty($mailPassword) && $mailPassword !== 'Not set') {
    $maskedPassword = substr($mailPassword, 0, 3) . str_repeat('*', max(0, strlen($mailPassword) - 6)) . substr($mailPassword, -3);
    printf("%-20s %s\n", "Password Preview:", $maskedPassword);
}

echo "\n";

// Gmail-specific validation
echo "📧 Gmail Configuration Validation:\n";
echo "===================================\n";

$gmailChecks = [
    'SMTP Host' => [
        'value' => $mailHost,
        'expected' => 'smtp.gmail.com',
        'status' => $mailHost === 'smtp.gmail.com' ? '✅' : '❌'
    ],
    'SMTP Port' => [
        'value' => $mailPort,
        'expected' => '587',
        'status' => $mailPort == 587 ? '✅' : '❌'
    ],
    'Encryption' => [
        'value' => $mailEncryption,
        'expected' => 'tls',
        'status' => strtolower($mailEncryption) === 'tls' ? '✅' : '❌'
    ],
    'Username Format' => [
        'value' => $mailUsername,
        'expected' => 'Gmail email address',
        'status' => filter_var($mailUsername, FILTER_VALIDATE_EMAIL) && strpos($mailUsername, '@gmail.com') ? '✅' : '❌'
    ]
];

foreach ($gmailChecks as $check => $data) {
    printf("%s %-20s %s (Expected: %s)\n", 
        $data['status'], 
        $check . ':', 
        $data['value'], 
        $data['expected']
    );
}

echo "\n";

// Environment file check
echo "📝 Environment File Analysis:\n";
echo "==============================\n";

$envFile = '.env';
if (file_exists($envFile)) {
    echo "✅ .env file found\n";
    
    $envContent = file_get_contents($envFile);
    $envLines = explode("\n", $envContent);
    
    $mailEnvVars = [];
    foreach ($envLines as $line) {
        $line = trim($line);
        if (strpos($line, 'MAIL_') === 0 && strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $mailEnvVars[trim($key)] = trim($value, '"\'');
        }
    }
    
    echo "\n📋 Mail-related environment variables:\n";
    foreach ($mailEnvVars as $key => $value) {
        if ($key === 'MAIL_PASSWORD') {
            $displayValue = $isPlaceholder ? 
                "❌ PLACEHOLDER: " . $value : 
                "🔐 SET (" . strlen($value) . " chars)";
        } else {
            $displayValue = $value;
        }
        printf("   %-20s %s\n", $key . ':', $displayValue);
    }
} else {
    echo "❌ .env file not found\n";
}

echo "\n";

// Overall status and recommendations
echo "🎯 OVERALL STATUS & RECOMMENDATIONS\n";
echo "====================================\n";

$issues = [];
$criticalIssues = 0;

// Check critical issues
if ($mailHost !== 'smtp.gmail.com') {
    $issues[] = "❌ CRITICAL: SMTP host should be 'smtp.gmail.com'";
    $criticalIssues++;
}

if ($mailPort != 587) {
    $issues[] = "❌ CRITICAL: SMTP port should be 587";
    $criticalIssues++;
}

if (strtolower($mailEncryption) !== 'tls') {
    $issues[] = "❌ CRITICAL: Encryption should be 'tls'";
    $criticalIssues++;
}

if (!filter_var($mailUsername, FILTER_VALIDATE_EMAIL) || !strpos($mailUsername, '@gmail.com')) {
    $issues[] = "❌ CRITICAL: Username should be a valid Gmail address";
    $criticalIssues++;
}

if ($isPlaceholder || empty($mailPassword)) {
    $issues[] = "❌ CRITICAL: Gmail App Password not configured properly";
    $criticalIssues++;
}

if (empty($issues)) {
    echo "🎉 EXCELLENT! All Gmail configuration appears correct.\n";
    echo "   Your email system should work properly.\n\n";
    
    echo "🧪 Next steps:\n";
    echo "   1. Test email sending with: php artisan tinker\n";
    echo "   2. Create an order via API to test notifications\n";
    echo "   3. Check Gmail inbox for order notifications\n";
} else {
    echo "⚠️  ISSUES FOUND: " . count($issues) . " problem(s) detected\n";
    echo "   Critical issues: " . $criticalIssues . "\n\n";
    
    foreach ($issues as $issue) {
        echo "   " . $issue . "\n";
    }
    
    echo "\n";
    
    if ($isPlaceholder || empty($mailPassword)) {
        echo "🔧 REQUIRED ACTION: Set up Gmail App Password\n";
        echo "==============================================\n";
        echo "1. Go to: https://myaccount.google.com/security\n";
        echo "2. Enable 2-Step Verification (if not enabled)\n";
        echo "3. Go to 'App passwords' section\n";
        echo "4. Create new app password for 'Mail'\n";
        echo "5. Copy the 16-character password\n";
        echo "6. Update .env file:\n";
        echo "   MAIL_PASSWORD=your_real_16_character_password\n";
        echo "7. Restart Laravel: php artisan serve\n\n";
    }
}

// Test connection advice
echo "🔍 Testing Email Configuration:\n";
echo "================================\n";
echo "To test if your configuration works:\n\n";

echo "1. Quick Laravel test:\n";
echo "   php artisan tinker\n";
echo "   > Mail::raw('Test email', function(\$message) {\n";
echo "   >     \$message->to('" . $mailUsername . "')->subject('Test');\n";
echo "   > });\n\n";

echo "2. Create test order via API:\n";
echo "   POST http://localhost:8000/api/orders\n";
echo "   (This will trigger order notification email)\n\n";

echo "3. Check Laravel logs for email errors:\n";
echo "   tail -f storage/logs/laravel.log\n\n";

$timestamp = date('Y-m-d H:i:s');
echo "📊 Configuration check completed at: {$timestamp}\n";
echo "==================================================\n\n";

?>
