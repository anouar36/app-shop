<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'last_name',
        'email',
        'phone',
        'password',
        'id_role',
        'auth',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'auth' => 'boolean',
        ];
    }

    /**
     * Get the role that owns the User
     */
    public function role()
    {
        return $this->belongsTo(Role::class, 'id_role');
    }

    /**
     * Get all of the orders for the User
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'client_id');
    }

    /**
     * Get all admin users emails
     */
    public static function getAdminEmails()
    {
        // Get admin users by role name 'admin' or by role ID 1 (assuming admin role)
        $adminUsers = self::whereHas('role', function($query) {
            $query->where('role_name', 'admin')
                  ->orWhere('role_name', 'Admin')
                  ->orWhere('role_name', 'ADMIN');
        })->orWhere('id_role', 1) // Fallback: assume role ID 1 is admin
          ->get();

        return $adminUsers->pluck('email')->toArray();
    }

    /**
     * Get the first admin email (primary admin)
     */
    public static function getPrimaryAdminEmail()
    {
        $adminEmails = self::getAdminEmails();
        return !empty($adminEmails) ? $adminEmails[0] : config('mail.admin_email', 'admin@ayoube.ma');
    }

    /**
     * Check if user is admin
     */
    public function isAdmin()
    {
        return $this->role && (
            strtolower($this->role->role_name) === 'admin' || 
            $this->id_role == 1
        );
    }
}
