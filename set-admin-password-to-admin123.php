<?php
require_once 'shop-backend/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'shop-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Reset admin password to admin123
$admin = App\Models\User::where('email', 'admin@shop.com')->first();
if ($admin) {
    $admin->password = \Illuminate\Support\Facades\Hash::make('admin123');
    $admin->save();
    echo "Admin password reset to 'admin123'\n";
    echo "Admin ID: {$admin->id}, Email: {$admin->email}\n";
    echo "Frontend demo credentials now match database!\n";
} else {
    echo "Admin user not found\n";
}
