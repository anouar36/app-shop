<?php
// Script to create the ayoube database and run Laravel migrations

// Create the database
$mysqli = new mysqli('localhost', 'root', '');

// Check connection
if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

// Create database
$sql = "CREATE DATABASE IF NOT EXISTS ayoube";
if ($mysqli->query($sql) === TRUE) {
    echo "Database 'ayoube' created successfully\n";
} else {
    echo "Error creating database: " . $mysqli->error . "\n";
}

$mysqli->close();

// Change directory to Laravel project and run migrations
echo "Running Laravel migrations...\n";
chdir(__DIR__ . '/shop-backend');
$output = [];
exec('php artisan migrate --force', $output);

foreach ($output as $line) {
    echo $line . "\n";
}

echo "\nDatabase setup complete! The application is now using the 'ayoube' MySQL database.\n";
?>
