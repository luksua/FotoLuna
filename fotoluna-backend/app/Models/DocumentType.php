<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
