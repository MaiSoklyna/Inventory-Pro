<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Add calls to individual seeders here
        $this->call([
            UserSeeder::class,
            ContactSeeder::class,
            ItemSeeder::class,
            PurchaseSeeder::class,
            SaleSeeder::class,
        ]);
    }
}
