<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Note: CORS should be handled by the framework/middleware. Avoid adding
// duplicate Access-Control headers here to prevent browsers rejecting requests.

// Force API routes to return JSON when called directly from the browser
// so unauthenticated API calls don't try to redirect to a missing `login` route.
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
if (str_contains($requestUri, '/api/')) {
    // Ensure Laravel treats this as an API request
    if (empty($_SERVER['HTTP_ACCEPT']) || !str_contains($_SERVER['HTTP_ACCEPT'], 'application/json')) {
        $_SERVER['HTTP_ACCEPT'] = 'application/json';
    }
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
