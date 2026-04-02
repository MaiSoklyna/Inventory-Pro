cd c:\xampp\htdocs\sale_prom\backend
php -r "
require 'vendor/autoload.php';
\$app = require 'bootstrap/app.php';
\$kernel = \$app->make(\Illuminate\Contracts\Console\Kernel::class);
\$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

\$user = User::where('email', 'admin@example.com')->first();
if (\$user) {
    echo 'Admin user already exists' . PHP_EOL;
} else {
    User::create([
        'name' => 'Admin User',
        'email' => 'admin@example.com',
        'password' => Hash::make('password'),
    ]);
    echo 'Admin user created successfully' . PHP_EOL;
}
"
