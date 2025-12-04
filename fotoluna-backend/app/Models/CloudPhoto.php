<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CloudPhoto extends Model
{
    protected $table = 'cloud_photos';

    protected $fillable = [
        'customerIdFK',
        'bookingIdFK',
        'storage_subscription_id',
        'path',
        'thumbnail_path',
        'original_name',
        'size',
    ];

    public function subscription()
    {
        return $this->belongsTo(StorageSubscription::class, 'storage_subscription_id');
    }
    public function booking()
    {
        return $this->belongsTo(Booking::class, 'bookingIdFK', 'bookingId');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customerIdFK', 'customerId');
    }
}
