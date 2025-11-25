<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    use HasFactory;

    protected $table = 'employees';
    protected $primaryKey = 'employeeId';
    public $incrementing = true;
    protected $keyType = 'int';
    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'firstNameEmployee',
        'lastNameEmployee',
        'phoneEmployee',
        'photoEmployee',
        'address',
        'documentType',
        'documentNumber',
        'emailEmployee',
        'password',
        'employeeType',
        'gender',
        'EPS',
        'role',
        'specialty',
        'isAvailable',
    ];

    protected $casts = [
        'isAvailable' => 'boolean',
    ];

    // Relación con reservas o bookings
    public function bookings()
    {
        return $this->hasMany(Booking::class, 'employeeIdFK', 'employeeId');
    }

    // Filtro rápido para fotógrafos disponibles
    public function scopeAvailablePhotographers($query)
    {
        return $query->where('employeeType', 'Employee')->where('isAvailable', true);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id', 'id');
    }
}