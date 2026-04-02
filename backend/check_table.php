<?php
require 'vendor/autoload.php';
$app = require 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;

if (Schema::hasTable('personal_access_tokens')) {
    echo "TABLE_OK\n";
} else {
    echo "NO_TABLE\n";
}
