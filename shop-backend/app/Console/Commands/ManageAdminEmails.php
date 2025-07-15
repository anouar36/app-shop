<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Role;
use Illuminate\Console\Command;

class ManageAdminEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'admin:emails {action=list : Action to perform (list|test|add)}
                           {email? : Email address for add action}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Manage admin emails for order notifications (list, test, add)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $action = $this->argument('action');

        switch ($action) {
            case 'list':
                $this->listAdminEmails();
                break;
            case 'test':
                $this->testAdminEmails();
                break;
            case 'add':
                $this->addAdminUser();
                break;
            default:
                $this->error("Invalid action: {$action}");
                $this->info('Available actions: list, test, add');
                return 1;
        }

        return 0;
    }

    private function listAdminEmails()
    {
        $this->info('📧 Current Admin Emails for Order Notifications:');
        $this->line('');

        $adminEmails = User::getAdminEmails();
        
        if (empty($adminEmails)) {
            $this->warn('❌ No admin users found in database!');
            $fallback = config('mail.admin_email', 'admin@ayoube.ma');
            $this->info("📧 Fallback email from .env: {$fallback}");
        } else {
            $this->info("✅ Found " . count($adminEmails) . " admin email(s):");
            foreach ($adminEmails as $index => $email) {
                $isPrimary = $index === 0 ? ' (Primary)' : '';
                $this->line("  📧 {$email}{$isPrimary}");
            }
        }

        $this->line('');
        $this->info('💡 Primary email: ' . User::getPrimaryAdminEmail());
    }

    private function testAdminEmails()
    {
        $this->info('🧪 Testing Admin Email System:');
        $this->line('');

        // Test database connection
        try {
            $totalUsers = User::count();
            $this->info("✅ Database connection: OK ({$totalUsers} users total)");
        } catch (\Exception $e) {
            $this->error("❌ Database connection failed: " . $e->getMessage());
            return;
        }

        // Test roles
        try {
            $roles = Role::all();
            $this->info("✅ Roles table: OK ({$roles->count()} roles found)");
            foreach ($roles as $role) {
                $userCount = User::where('id_role', $role->id)->count();
                $this->line("  📝 Role '{$role->role_name}' (ID: {$role->id}): {$userCount} users");
            }
        } catch (\Exception $e) {
            $this->warn("⚠️ Roles table issue: " . $e->getMessage());
        }

        // Test admin detection
        $adminEmails = User::getAdminEmails();
        $this->line('');
        $this->info('🔍 Admin Detection Results:');
        
        if (empty($adminEmails)) {
            $this->warn('❌ No admin users detected');
            $this->info('📧 Will use fallback: ' . config('mail.admin_email'));
        } else {
            $this->info("✅ Detected " . count($adminEmails) . " admin(s):");
            foreach ($adminEmails as $email) {
                $user = User::where('email', $email)->with('role')->first();
                $roleName = $user->role ? $user->role->role_name : 'Unknown';
                $this->line("  📧 {$email} (Role: {$roleName}, ID: {$user->id_role})");
            }
        }
    }

    private function addAdminUser()
    {
        $email = $this->argument('email');
        
        if (!$email) {
            $email = $this->ask('Enter admin email address');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email address!');
            return;
        }

        if (User::where('email', $email)->exists()) {
            $this->warn("User with email {$email} already exists!");
            return;
        }

        $name = $this->ask('Enter admin first name');
        $lastName = $this->ask('Enter admin last name');
        $password = $this->secret('Enter admin password');

        // Get or create admin role
        $adminRole = Role::firstOrCreate(['role_name' => 'admin']);

        try {
            $user = User::create([
                'name' => $name,
                'last_name' => $lastName,
                'email' => $email,
                'password' => bcrypt($password),
                'id_role' => $adminRole->id,
                'auth' => true,
                'phone' => $this->ask('Enter phone number (optional)', null)
            ]);

            $this->info("✅ Admin user created successfully!");
            $this->line("📧 Email: {$user->email}");
            $this->line("👤 Name: {$user->name} {$user->last_name}");
            $this->line("🔑 Role: {$adminRole->role_name} (ID: {$adminRole->id})");
            
        } catch (\Exception $e) {
            $this->error("❌ Failed to create admin user: " . $e->getMessage());
        }
    }
}
