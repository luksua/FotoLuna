<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    protected $primaryKey = 'appointmentId';
    protected $fillable = [
        'AppointmentId',
        'eventIdFK',
        'customerIdFK',
        'appointmentDate',
        'appointmentTime',
        'place',
        'comment',
    ];
}
