<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

class BookingPaymentInstallment extends Model
{
    protected $table = 'booking_payment_installments';

    protected $fillable = [
        'bookingIdFK',
        'number',
        'due_date',
        'amount',
        'status',
        'paid_at',
        'paymentIdFK',
        'receipt_path',
    ];

    protected $casts = [
        'due_date' => 'date',
        'paid_at'  => 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'bookingIdFK', 'bookingId');
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class, 'paymentIdFK', 'paymentId');
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->status === 'pending'
            && $this->due_date->isPast();
    }
}
