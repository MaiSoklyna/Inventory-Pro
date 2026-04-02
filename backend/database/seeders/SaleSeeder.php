<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SaleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $customerId = DB::table('contacts')->where('type', 'customer')->value('id');

        if ($customerId) {
            DB::table('sales')->updateOrInsert(
                [
                    'sale_number' => 'SAL-SEED1',
                ],
                [
                    'contact_id' => $customerId,
                    'sale_date' => now()->toDateString(),
                    'due_date' => now()->addDays(30)->toDateString(),
                    'total_amount' => 300.00,
                    'paid_amount' => 300.00,
                    'status' => 'completed',
                    'payment_status' => 'paid',
                    'note' => 'Sample sale via seeder',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}