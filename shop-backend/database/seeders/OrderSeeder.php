<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Get some users and products to create orders with
        $users = User::where('id_role', 2)->get(); // Get client users
        $products = Product::all();

        if ($users->isEmpty() || $products->isEmpty()) {
            $this->command->warn('No users or products found. Please seed users and products first.');
            return;
        }

        $statuses = ['new', 'processing', 'route', 'changed', 'completed', 'cancelled'];
        $paymentMethods = ['credit_card', 'debit_card', 'paypal', 'cash_on_delivery', 'bank_transfer'];
        
        $orderData = [
            [
                'client_name' => 'John',
                'client_lastname' => 'Smith',
                'email' => 'john.smith@email.com',
                'phone' => '+1234567890',
                'status' => 'new'
            ],
            [
                'client_name' => 'Emily',
                'client_lastname' => 'Johnson',
                'email' => 'emily.johnson@email.com',
                'phone' => '+1234567891',
                'status' => 'processing'
            ],
            [
                'client_name' => 'Michael',
                'client_lastname' => 'Brown',
                'email' => 'michael.brown@email.com',
                'phone' => '+1234567892',
                'status' => 'route'
            ],
            [
                'client_name' => 'Sarah',
                'client_lastname' => 'Wilson',
                'email' => 'sarah.wilson@email.com',
                'phone' => '+1234567893',
                'status' => 'completed'
            ],
            [
                'client_name' => 'David',
                'client_lastname' => 'Lee',
                'email' => 'david.lee@email.com',
                'phone' => '+1234567894',
                'status' => 'completed'
            ],
            [
                'client_name' => 'Lisa',
                'client_lastname' => 'Davis',
                'email' => 'lisa.davis@email.com',
                'phone' => '+1234567895',
                'status' => 'changed'
            ],
            [
                'client_name' => 'Robert',
                'client_lastname' => 'Miller',
                'email' => 'robert.miller@email.com',
                'phone' => '+1234567896',
                'status' => 'cancelled'
            ],
            [
                'client_name' => 'Jessica',
                'client_lastname' => 'Anderson',
                'email' => 'jessica.anderson@email.com',
                'phone' => '+1234567897',
                'status' => 'processing'
            ],
            [
                'client_name' => 'William',
                'client_lastname' => 'Taylor',
                'email' => 'william.taylor@email.com',
                'phone' => '+1234567898',
                'status' => 'route'
            ],
            [
                'client_name' => 'Ashley',
                'client_lastname' => 'Thomas',
                'email' => 'ashley.thomas@email.com',
                'phone' => '+1234567899',
                'status' => 'new'
            ]
        ];

        foreach ($orderData as $index => $data) {
            $user = $users->random();
            $product = $products->random();
            
            Order::create([
                'client_id' => $user->id,
                'products_id' => $product->id,
                'client_name' => $data['client_name'],
                'client_lastname' => $data['client_lastname'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'method_payment' => $paymentMethods[array_rand($paymentMethods)],
                'date_creation' => now()->subDays(rand(0, 30)),
                'date_arrival' => now()->addDays(rand(1, 14)),
                'status' => $data['status'],
                'created_at' => now()->subDays(rand(0, 30)),
                'updated_at' => now()->subDays(rand(0, 5)),
            ]);
        }

        $this->command->info('Orders seeded successfully!');
    }
}
