<?php
require 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

echo "DB_CONNECTION: " . ($_ENV['DB_CONNECTION'] ?? getenv('DB_CONNECTION')) . PHP_EOL;
echo "DB_HOST: " . ($_ENV['DB_HOST'] ?? getenv('DB_HOST')) . PHP_EOL;
echo "DB_PORT: " . ($_ENV['DB_PORT'] ?? getenv('DB_PORT')) . PHP_EOL;
echo "DB_DATABASE: " . ($_ENV['DB_DATABASE'] ?? getenv('DB_DATABASE')) . PHP_EOL;
echo "DB_USERNAME: " . ($_ENV['DB_USERNAME'] ?? getenv('DB_USERNAME')) . PHP_EOL;
echo "DB_PASSWORD: '" . ($_ENV['DB_PASSWORD'] ?? getenv('DB_PASSWORD')) . "'" . PHP_EOL;
echo "Full .env file check:" . PHP_EOL;

$envFile = file_get_contents('.env');
$lines = explode("\n", $envFile);
foreach ($lines as $line) {
    if (strpos($line, 'DB_') === 0) {
        echo $line . PHP_EOL;
    }
}
