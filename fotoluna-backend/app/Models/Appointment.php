<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Appointment extends Model
{
    use HasFactory;

    protected $primaryKey = 'appointmentId';
    protected $fillable = [
        'AppointmentId',
        'eventIdFK',
        'customerIdFK',
        'appointmentDate',
        'appointmentTime',
        'place',
        'comment',
        'appointmentStatus',
        'employeeIdFK',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customerIdFK', 'customerId');
    }

    public function event()
    {
        return $this->belongsTo(Event::class, 'eventIdFK', 'eventId');
    }

    // Si una cita puede tener varias reservas (bookings)
    public function bookings()
    {
        return $this->hasMany(Booking::class, 'appointmentIdFK', 'appointmentId');
    }

    // Si solo hay una reserva por cita, puedes usar hasOne también:
    public function booking()
    {
        return $this->hasOne(Booking::class, 'appointmentIdFK', 'appointmentId');
    }
}
