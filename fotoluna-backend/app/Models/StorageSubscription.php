<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StorageSubscription extends Model
{
    use HasFactory;

    protected $table = 'storage_subscriptions';
    protected $primaryKey = 'id';

    protected $fillable = [
        'customerIdFK',
        'plan_id',
        'bookingIdFK',
        'starts_at',
        'ends_at',
        'status',
        'payment_id',
        'mp_payment_id',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    /* --------------------------
        🔗 RELACIONES
       -------------------------- */

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customerIdFK', 'customerId');
    }

    public function plan()
    {
        return $this->belongsTo(StoragePlan::class, 'plan_id');
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class, 'bookingIdFK', 'bookingId');
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class, 'payment_id');
    }
}
