<?php

// Simple script to create admin user for testing
require_once __DIR__ . '/shop-backend/vendor/autoload.php';

use Illuminate\Support\Facades\Hash;

// Bootstrap Laravel
$app = require_once __DIR__ . '/shop-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    // Create admin user
    $adminUser = \App\Models\User::updateOrCreate(
        ['email' => 'admin@admin.com'],
        [
            'name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@admin.com',
            'phone' => '+1234567890',
            'password' => Hash::make('admin123'),
            'id_role' => 1, // Assuming 1 is admin role
            'auth' => true,
        ]
    );

    echo "✅ Admin user created/updated successfully!\n";
    echo "Email: admin@admin.com\n";
    echo "Password: admin123\n";
    echo "User ID: {$adminUser->id}\n";
    echo "Role ID: {$adminUser->id_role}\n";

    // Test if we can generate a token
    $token = $adminUser->createToken('admin-test')->plainTextToken;
    echo "Test Token: {$token}\n";

} catch (Exception $e) {
    echo "❌ Error creating admin user: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
