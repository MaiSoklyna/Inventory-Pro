<?php
$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json\r\nOrigin: http://localhost\r\nReferer: http://localhost/sale_prom/frontend/dist/index.html\r\nAccept: application/json",
        'content' => json_encode(['email' => 'admin@example.com', 'password' => 'password']),
        'ignore_errors' => true // to see the body on 4xx/5xx
    ]
]);
$result = file_get_contents('http://localhost/sale_prom/backend/public/api/login', false, $context);
echo "Status: " . $http_response_header[0] . "\n";
echo "Body: " . $result . "\n";
