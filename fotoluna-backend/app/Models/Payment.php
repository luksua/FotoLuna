<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Payment extends Model
{
    use HasFactory;
    protected $table = 'payments';
    protected $primaryKey = 'paymentId';
    

    protected $fillable = [
        'bookingIdFK',
        'amount',
        'paymentDate',
        'paymentMethod',   // Card, PSE, Nequi, Daviplata, Cash, Transfer
        'paymentStatus',   // Pending, Approved, Rejected, PendingConfirmation, etc.
        'installments',
        'mp_payment_id',
        'card_last_four',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'bookingIdFK', 'bookingId');
    }
}
