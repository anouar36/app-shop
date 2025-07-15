<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    /**
     * Get all of the products for the Category
     */
    public function products()
    {
        return $this->hasMany(Product::class, 'category_id');
    }
}
