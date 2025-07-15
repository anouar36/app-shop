<?php
// Test API request for users with phone numbers
$url = 'http://127.0.0.1:8001/api/admin/users';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . (isset($argv[1]) ? $argv[1] : ''),
    'Content-Type: application/json'
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Response Code: {$httpCode}\n";
$responseData = json_decode($response, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo "Error parsing JSON: " . json_last_error_msg() . "\n";
    echo "Raw response: " . $response . "\n";
} else {
    if (!is_array($responseData)) {
        echo "API Error: Response is not an array\n";
    } else {
        echo "Users found: " . count($responseData) . "\n";
        foreach ($responseData as $user) {
            echo "ID: {$user['id']}, Name: {$user['name']} {$user['last_name']}, Email: {$user['email']}, Phone: " . 
                 (isset($user['phone']) ? $user['phone'] : 'Not provided') . "\n";
        }
    }
}
