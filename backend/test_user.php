<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

try {
    $user = User::where('email', 'admin@example.com')->first();
    if ($user) {
        echo "User found: " . $user->email . "\n";
        echo "User has createToken method: " . (method_exists($user, 'createToken') ? 'yes' : 'no') . "\n";
        $traits = class_uses($user);
        echo "User traits: " . implode(", ", array_keys($traits)) . "\n";
    } else {
        echo "No user found\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
