<?php

// Simple script to set up admin role and user correctly   
require_once __DIR__ . '/shop-backend/vendor/autoload.php';

use Illuminate\Support\Facades\Hash;

// Bootstrap Laravel
$app = require_once __DIR__ . '/shop-backend/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

try {
    // Step 1: Create admin role
    $adminRole = \App\Models\Role::updateOrCreate(
        ['role_name' => 'admin'],
        ['role_name' => 'admin']
    );

    echo "✅ Admin role created/updated successfully!\n";
    echo "Role ID: {$adminRole->id}\n";
    echo "Role Name: {$adminRole->role_name}\n\n";

    // Step 2: Create client role for regular users
    $clientRole = \App\Models\Role::updateOrCreate(
        ['role_name' => 'client'],
        ['role_name' => 'client']
    );

    echo "✅ Client role created/updated successfully!\n";
    echo "Role ID: {$clientRole->id}\n";
    echo "Role Name: {$clientRole->role_name}\n\n";

    // Step 3: Create admin user with proper role
    $adminUser = \App\Models\User::updateOrCreate(
        ['email' => 'admin@admin.com'],
        [
            'name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@admin.com',
            'phone' => '+1234567890',
            'password' => Hash::make('admin123'),
            'id_role' => $adminRole->id, // Use the actual admin role ID
            'auth' => true,
        ]
    );

    echo "✅ Admin user created/updated successfully!\n";
    echo "Email: admin@admin.com\n";
    echo "Password: admin123\n";
    echo "User ID: {$adminUser->id}\n";
    echo "Role ID: {$adminUser->id_role}\n";

    // Step 4: Verify the relationship works
    $adminUser->load('role');
    echo "Role Name: {$adminUser->role->role_name}\n";
    echo "Is Admin: " . ($adminUser->isAdmin() ? 'Yes' : 'No') . "\n\n";

    // Step 5: Test token generation
    $token = $adminUser->createToken('admin-test')->plainTextToken;
    echo "✅ Test Token Generated: {$token}\n\n";

    echo "🎉 Setup complete! You can now use:\n";
    echo "   Email: admin@admin.com\n";
    echo "   Password: admin123\n";
    echo "   Token: {$token}\n";

} catch (Exception $e) {
    echo "❌ Error setting up admin: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
