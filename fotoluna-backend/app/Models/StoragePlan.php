<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoragePlan extends Model
{
    protected $fillable = [
        'name',
        'description',
        'max_photos',
        'max_storage_mb',
        'duration_months',
        'price',
        'is_active',
    ];

    public function subscriptions()
    {
        return $this->hasMany(StorageSubscription::class, 'planIdFK');
    }
}
