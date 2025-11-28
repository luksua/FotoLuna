<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $primaryKey = 'packageId';
    public $timestamps = false;

    protected $fillable = [
        'packageName',
        'packageDescription',
        'price',
        'eventIdFK',
        'isGeneral',
        'state'
    ];

    public function event()
    {
        return $this->belongsTo(Event::class, 'eventIdFK', 'eventId');
    }

    // Scope para filtrar por evento
    public function scopeForEvent($query, $eventId)
    {
        return $query->where('isGeneral', true)
            ->orWhere('eventIdFK', $eventId);
    }
    
    public function photos()
    {
        return $this->hasMany(Photo::class, 'packageIdFK', 'id');
    }

}
