<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'category_id',
        'price',
        'description',
        'reviews',
        'current_price',
        'size',
        'image',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'current_price' => 'decimal:2',
        'reviews' => 'integer',
    ];

    /**
     * Get the category that owns the Product
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get all of the orders for the Product
     */
    public function orders()
    {
        return $this->hasMany(Order::class, 'products_id');
    }
}
