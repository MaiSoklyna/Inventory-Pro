<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('items')->updateOrInsert(
            ['sku' => 'ITEM-001'],
            [
                'name' => 'Sample Item',
                'description' => 'A sample item description.',
                'category' => 'General',
                'cost_price' => 50.00,
                'sell_price' => 100.00,
                'stock_on_hand' => 50,
                'reorder_level' => 10,
                'average_cost' => 50.00,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }
}