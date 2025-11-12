<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Photo extends Model
{
    protected $primaryKey = 'photoId';
    protected $fillable = ['packageIdFK', 'photoPath'];

    protected $appends = ['url']; // 👈 esto añade el campo virtual "url" al JSON

    public function getUrlAttribute()
    {
        // Si tus imágenes se guardan en storage/app/public/photos
        if ($this->photoPath) {
            return Storage::url($this->photoPath);
        }

        // Si las guardas directamente en /public, usa:
        // return asset('photos/' . $this->photoPath);
        return null;
    }

    public function package()
    {
        return $this->belongsTo(Package::class, 'packageIdFK', 'packageId');
    }
}
