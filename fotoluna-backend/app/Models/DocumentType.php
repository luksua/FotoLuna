<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Event;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentType extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'number',
        'photoUrl',
        'requiresUpload',
        'requiresPresence',
    ];

    public function event(): BelongsTo 
    {
        // document_types.eventIdFK apunta a events.eventId
        return $this->belongsTo(Event::class, 'eventIdFK', 'eventId');
    }
}
