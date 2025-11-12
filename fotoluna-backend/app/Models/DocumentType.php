<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
