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
}
