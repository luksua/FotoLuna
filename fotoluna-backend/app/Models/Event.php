<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Package;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $primaryKey = 'eventId';
    public $timestamps = false;

    protected $fillable = [
        'eventType',
        'category',
        'state'
    ];

    public function getNameAttribute()
    {
        return $this->eventType;
    }
    public function packages(): HasMany // 🟢 AÑADIDO
    {
        // 'eventIdFK' es la clave foránea en la tabla 'packages'
        // 'eventId' es la clave primaria en la tabla 'events'
        return $this->hasMany(Package::class, 'eventIdFK', 'eventId');
    }
    public function documentTypes(): HasMany
    {
        // 'eventIdFK' en la tabla 'document_types'
        return $this->hasMany(DocumentType::class, 'eventIdFK', 'eventId');
    }
}
