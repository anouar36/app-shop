<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WhatsappMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'phone_number',
        'message_type',
        'message_content',
        'status',
        'sent_at',
        'confirmed_at'
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'confirmed_at' => 'datetime'
    ];

    /**
     * Get the order that this WhatsApp message belongs to
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
