<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

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

    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'employeeIdFK', 'employeeId');
    }


    // Relación con reservas o bookings
    public function bookings()
    {
        return $this->hasMany(Booking::class, 'employeeIdFK', 'employeeId');
    }

    // Filtro rápido para fotógrafos disponibles
    public function scopeAvailablePhotographers($query, string $date, string $time, int $durationMinutes)
    {
        $start = Carbon::parse("$date $time");
        $end = $start->copy()->addMinutes($durationMinutes);

        $startStr = $start->format('Y-m-d H:i:s');
        $endStr = $end->format('Y-m-d H:i:s');

        return $query->whereDoesntHave('bookings', function ($q) use ($startStr, $endStr) {
            $q->whereIn('bookingStatus', ['Pending', 'Confirmed'])   // ajusta según tu lógica
                ->whereHas('appointment', function ($qa) use ($startStr, $endStr) {
                    $qa->whereRaw("
                  CONCAT(appointmentDate, ' ', appointmentTime) < ?
                  AND DATE_ADD(
                      CONCAT(appointmentDate, ' ', appointmentTime),
                      INTERVAL appointmentDuration MINUTE
                  ) > ?
              ", [$endStr, $startStr]);
                });
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}