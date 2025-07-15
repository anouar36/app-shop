<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('products')->insert([
            [
                'name' => 'iPhone 15 Pro',
                'category_id' => 1, // Electronics
                'category_id_int' => 1,
                'price' => 999.99,
                'description' => 'Latest iPhone with advanced features',
                'reviews' => 0,
                'current_price' => 899.99,
                'size' => '6.1 inch',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Nike Air Max',
                'category_id' => 3, // Shoes
                'category_id_int' => 3,
                'price' => 129.99,
                'description' => 'Comfortable running shoes',
                'reviews' => 0,
                'current_price' => 109.99,
                'size' => 'US 10',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Cotton T-Shirt',
                'category_id' => 2, // Clothing
                'category_id_int' => 2,
                'price' => 29.99,
                'description' => 'Comfortable 100% cotton t-shirt',
                'reviews' => 0,
                'current_price' => 24.99,
                'size' => 'M',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
