<?php
// Script to refresh and seed the database with all available seeders

// Change directory to Laravel project
chdir(__DIR__ . '/shop-backend');

echo "Starting database refresh and seeding process...\n";

// Refresh the database (drop all tables and recreate them)
echo "Refreshing database...\n";
$output = [];
exec('php artisan migrate:fresh --force', $output);
foreach ($output as $line) {
    echo $line . "\n";
}

// Run all seeders
echo "\nSeeding database with initial data...\n";
$output = [];
exec('php artisan db:seed --force', $output);
foreach ($output as $line) {
    echo $line . "\n";
}

echo "\nDatabase setup complete! All tables initialized with seed data.\n";
?>
