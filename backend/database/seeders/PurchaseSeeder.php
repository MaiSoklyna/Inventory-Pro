<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PurchaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $supplierId = DB::table('contacts')->where('type', 'supplier')->value('id');

        if ($supplierId) {
            DB::table('purchases')->updateOrInsert(
                [
                    'purchase_number' => 'PUR-SEED1',
                ],
                [
                    'contact_id' => $supplierId,
                    'purchase_date' => now()->toDateString(),
                    'due_date' => now()->addDays(30)->toDateString(),
                    'total_amount' => 500.00,
                    'status' => 'completed',
                    'note' => 'Sample purchase via seeder',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}