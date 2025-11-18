<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $primaryKey = 'eventId';
    public $timestamps = false;

    protected $fillable = [
        'eventType',
        'category'
    ];
}
