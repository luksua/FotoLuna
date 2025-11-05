<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $table = 'customers';
    protected $primaryKey = 'customerId';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'firstNameCustomer',
        'lastNameCustomer',
        'photoCustomer',
        'emailCustomer',
        'password',
        'phoneCustomer',
        'documentType',
        'documentNumber',
    ];

    protected $hidden = [
        'password',
    ];

    protected $appends = ['photo_url'];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }

    public function getPhotoUrlAttribute()
    {
        if (! $this->photoCustomer) {
            return null;
        }

        return asset('storage/' . ltrim($this->photoCustomer, '/'));
    }
}