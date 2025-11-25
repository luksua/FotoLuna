<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class, 'customerIdFK', 'customerId');
    }

    public function event()
    {
        return $this->belongsTo(Event::class, 'eventIdFK', 'eventId');
    }
}
