<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Event;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentType extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'number',
        'number_photos',
        'photoUrl',
        'requiresUpload',
        'requiresPresence',
        'state'
    ];

    public function event(): BelongsTo 
    {
        // document_types.eventIdFK apunta a events.eventId
        return $this->belongsTo(Event::class, 'eventIdFK', 'eventId');
    }
}
