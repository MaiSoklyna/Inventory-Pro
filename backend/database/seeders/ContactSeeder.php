<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ContactSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('contacts')->updateOrInsert(
            ['email' => 'john.doe@example.com'],
            [
                'name' => 'John Doe',
                'phone' => '1234567890',
                'type' => 'customer',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        DB::table('contacts')->updateOrInsert(
            ['email' => 'supplier@example.com'],
            [
                'name' => 'Supplier Inc',
                'phone' => '0987654321',
                'type' => 'supplier',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }
}