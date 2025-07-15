<?php
// Test API request for orders with asc sorting
$url = 'http://127.0.0.1:8001/api/admin/orders?page=1&per_page=15&status=all&search=&sort_by=created_at&sort_order=asc';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer 1|gDSaBVTR4ks5a9NO8l8HxS1cWFzpaCpRJFjJ3HAMf01adada',  // Hardcoded token for testing
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
    if (isset($responseData['success']) && $responseData['success'] === false) {
        echo "API Error: {$responseData['message']}\n";
        if (isset($responseData['error'])) {
            echo "Error details: {$responseData['error']}\n";
        }
    } else {
        echo "Response: " . json_encode($responseData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_PARTIAL_OUTPUT_ON_ERROR) . "\n";
    }
}
