
<?php
require_once 'shop-backend/vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'shop-backend/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Check admin users
echo "Admin users in database:\n";
$adminUsers = App\Models\User::whereHas('role', function($q) { 
    $q->where('role_name', 'admin'); 
})->get(['id', 'name', 'email']);

foreach ($adminUsers as $user) {
    echo "ID: {$user->id}, Name: {$user->name}, Email: {$user->email}\n";
}

// Check all users
echo "\nAll users:\n";
$allUsers = App\Models\User::with('role')->get(['id', 'name', 'email']);
foreach ($allUsers as $user) {
    echo "ID: {$user->id}, Name: {$user->name}, Email: {$user->email}, Role: {$user->role->role_name}\n";
}
