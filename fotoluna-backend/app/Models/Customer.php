<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Appointment;
use App\Models\User;
use App\Models\DocumentType;
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
        'created_by_user_id',
    ];

    protected $hidden = [
        'password',
    ];

    protected $appends = ['photo_url'];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function getPhotoUrlAttribute()
    {
        if (!$this->photoCustomer) {
            return null;
        }

        return asset('storage/' . ltrim($this->photoCustomer, '/'));
    }
    public function appointments()
    {
        // customers.customerId  ⇄  appointments.customerIdFK
        return $this->hasMany(Appointment::class, 'customerIdFK', 'customerId');
    }

    public function documentType()
    {
        return $this->belongsTo(DocumentType::class, 'documentTypeFK', 'documentTypeId');
    }
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by_user_id', 'id');
    }
}