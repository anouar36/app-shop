<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'products_id',
        'quantity',
        'client_name',
        'client_lastname',
        'email',
        'phone',
        'delivery_address',
        'delivery_notes',
        'admin_notes',
        'customer_notes',
        'special_instructions',
        'method_payment',
        'date_creation',
        'date_arrival',
        'status',
        'payment_method',
        'payment_status',
        'payment_code',
        'payment_details',
        'payment_date',
    ];

    protected $casts = [
        'date_creation' => 'datetime',
        'date_arrival' => 'date',
        'payment_date' => 'datetime',
        'payment_details' => 'array',
    ];

    /**
     * Get the client that owns the Order
     */
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Get the user that owns the Order (alias for client)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /**
     * Get the product that owns the Order
     */
    public function product()
    {
        return $this->belongsTo(Product::class, 'products_id');
    }

    /**
     * Get all of the interactions for the Order
     */
    public function interactions()
    {
        return $this->hasMany(Interaction::class, 'order_id');
    }
}
