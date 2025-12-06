<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoragePlan extends Model
{
    protected $fillable = [
        'name',
        'description',
        'duration_months',
        'price',
        'max_photos',
        'max_storage_mb',
        'is_active',
    ];
public $timestamps = false;

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function subscriptions()
    {
        return $this->hasMany(StorageSubscription::class, 'planIdFK');
    }
}
