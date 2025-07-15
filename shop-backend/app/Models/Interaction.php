<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Interaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'texte',
        'starts',
    ];

    protected $casts = [
        'starts' => 'integer',
    ];

    /**
     * Get the order that owns the Interaction
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
