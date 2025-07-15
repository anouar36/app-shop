<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {        // Create a test admin user with password
        User::factory()->create([
            'name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@shop.com',
            'phone' => '+1 (555) 123-4567',
            'password' => Hash::make('admin123'),
            'id_role' => 1, // admin role
            'auth' => true,
        ]);

        // Create a test client user with password
        User::factory()->create([     
            'name' => 'Test',
            'last_name' => 'Client',
            'email' => 'client@shop.com',
            'phone' => '+1 (555) 987-6543',
            'password' => Hash::make('client123'),
            'id_role' => 2, // client role
            'auth' => true,
        ]);
        
        // Create some additional client users
        User::factory()->create([     
            'name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@email.com',
            'phone' => '+1 (555) 234-5678',
            'password' => Hash::make('password123'),
            'id_role' => 2, // client role
            'auth' => true,
        ]);
        
        User::factory()->create([     
            'name' => 'Jane',
            'last_name' => 'Smith',
            'email' => 'jane.smith@email.com',
            'phone' => '+1 (555) 345-6789',
            'password' => Hash::make('password123'),
            'id_role' => 2, // client role
            'auth' => true,
        ]);
        
        User::factory()->create([     
            'name' => 'Michael',
            'last_name' => 'Johnson',
            'email' => 'michael.johnson@email.com',
            'password' => Hash::make('password123'),
            'id_role' => 2, // client role
            'auth' => true,
        ]);
    }
}
