<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$email = 'admin@example.com';
$new = '12345';

$user = User::where('email', $email)->first();
if (!$user) {
    echo "User not found: $email\n";
    exit(1);
}

$user->password = Hash::make($new);
$user->save();

echo "Password for {$user->email} updated to '{$new}'\n";
