<?php

require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';

echo "Checking admin user...\n";

$user = App\Models\User::where('email', 'admin@shop.com')->first();

if ($user) {
    echo "Admin user found:\n";
    echo "ID: " . $user->id . "\n";
    echo "Name: " . $user->name . "\n";
    echo "Email: " . $user->email . "\n";
    echo "Created: " . $user->created_at . "\n";
    
    // Check if role relationship exists
    try {
        echo "Role: " . ($user->role ? $user->role->role_name : 'No role relationship') . "\n";
    } catch (Exception $e) {
        echo "Role relationship error: " . $e->getMessage() . "\n";
    }
    
    // Check user attributes
    echo "User attributes: " . json_encode($user->getAttributes()) . "\n";
    
} else {
    echo "Admin user not found!\n";
    echo "All users:\n";
    $users = App\Models\User::all();
    foreach ($users as $user) {
        echo "- ID: {$user->id}, Email: {$user->email}, Name: {$user->name}\n";
    }
}

?>
